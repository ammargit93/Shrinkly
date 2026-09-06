package compressor

import (
	"bytes"
	"fmt"
	"image"
	"image/jpeg"
	"image/png"
	"math"

	"github.com/chai2010/webp"
)

const MaxMegaPixels = 25_000_000

// resizeBilinear resizes an image using high-quality bilinear interpolation in pure Go.
func resizeBilinear(src image.Image, targetWidth, targetHeight int) *image.RGBA {
	bounds := src.Bounds()
	srcW := bounds.Dx()
	srcH := bounds.Dy()

	if targetWidth < 16 {
		targetWidth = 16
	}
	if targetHeight < 16 {
		targetHeight = 16
	}

	dst := image.NewRGBA(image.Rect(0, 0, targetWidth, targetHeight))
	if srcW <= 0 || srcH <= 0 {
		return dst
	}

	xRatio := float64(srcW-1) / float64(targetWidth)
	yRatio := float64(srcH-1) / float64(targetHeight)

	for y := 0; y < targetHeight; y++ {
		ySrc := float64(y) * yRatio
		yLow := int(ySrc)
		yHigh := yLow + 1
		if yHigh >= srcH {
			yHigh = srcH - 1
		}
		yWeight := ySrc - float64(yLow)

		for x := 0; x < targetWidth; x++ {
			xSrc := float64(x) * xRatio
			xLow := int(xSrc)
			xHigh := xLow + 1
			if xHigh >= srcW {
				xHigh = srcW - 1
			}
			xWeight := xSrc - float64(xLow)

			c00 := src.At(bounds.Min.X+xLow, bounds.Min.Y+yLow)
			c10 := src.At(bounds.Min.X+xHigh, bounds.Min.Y+yLow)
			c01 := src.At(bounds.Min.X+xLow, bounds.Min.Y+yHigh)
			c11 := src.At(bounds.Min.X+xHigh, bounds.Min.Y+yHigh)

			r00, g00, b00, a00 := c00.RGBA()
			r10, g10, b10, a10 := c10.RGBA()
			r01, g01, b01, a01 := c01.RGBA()
			r11, g11, b11, a11 := c11.RGBA()

			topR := float64(r00)*(1-xWeight) + float64(r10)*xWeight
			topG := float64(g00)*(1-xWeight) + float64(g10)*xWeight
			topB := float64(b00)*(1-xWeight) + float64(b10)*xWeight
			topA := float64(a00)*(1-xWeight) + float64(a10)*xWeight

			botR := float64(r01)*(1-xWeight) + float64(r11)*xWeight
			botG := float64(g01)*(1-xWeight) + float64(g11)*xWeight
			botB := float64(b01)*(1-xWeight) + float64(b11)*xWeight
			botA := float64(a01)*(1-xWeight) + float64(a11)*xWeight

			r := uint8((topR*(1-yWeight) + botR*yWeight) / 257)
			g := uint8((topG*(1-yWeight) + botG*yWeight) / 257)
			b := uint8((topB*(1-yWeight) + botB*yWeight) / 257)
			a := uint8((topA*(1-yWeight) + botA*yWeight) / 257)

			offset := dst.PixOffset(x, y)
			dst.Pix[offset] = r
			dst.Pix[offset+1] = g
			dst.Pix[offset+2] = b
			dst.Pix[offset+3] = a
		}
	}
	return dst
}

// encodeImage encodes the image into the specified format at given quality (for lossy).
func encodeImage(img image.Image, format string, quality int) ([]byte, error) {
	var buf bytes.Buffer
	var err error

	switch format {
	case "jpeg":
		err = jpeg.Encode(&buf, img, &jpeg.Options{Quality: quality})
	case "png":
		encoder := png.Encoder{CompressionLevel: png.BestCompression}
		err = encoder.Encode(&buf, img)
	case "webp":
		err = webp.Encode(&buf, img, &webp.Options{
			Lossless: false,
			Quality:  float32(quality),
		})
	default:
		return nil, fmt.Errorf("unsupported image format: %s", format)
	}

	if err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

// CompressImageToLimit iteratively compresses an image to strictly hit targetSizeKb.
func CompressImageToLimit(input []byte, targetSizeKb int) ([]byte, error) {
	if targetSizeKb <= 0 {
		return nil, fmt.Errorf("target size must be greater than 0 KB")
	}

	targetSizeBytes := targetSizeKb * 1024

	// 1. If original input is already under the target size limit, keep original untouched
	if len(input) <= targetSizeBytes {
		return input, nil
	}

	// 2. Pre-check dimensions against 25 MP limit
	if cfg, _, err := image.DecodeConfig(bytes.NewReader(input)); err == nil {
		if int64(cfg.Width)*int64(cfg.Height) > MaxMegaPixels {
			return nil, fmt.Errorf("image exceeds maximum limit of 25 megapixels (%dx%d = %d MP)", cfg.Width, cfg.Height, (int64(cfg.Width)*int64(cfg.Height))/1_000_000)
		}
	}

	// 3. Decode source image
	img, format, err := image.Decode(bytes.NewReader(input))
	if err != nil {
		return nil, fmt.Errorf("failed to decode image: %w", err)
	}

	bounds := img.Bounds()
	origW := bounds.Dx()
	origH := bounds.Dy()

	if int64(origW)*int64(origH) > MaxMegaPixels {
		return nil, fmt.Errorf("image exceeds maximum limit of 25 megapixels (%dx%d)", origW, origH)
	}

	var bestCandidate []byte
	minDimension := 24

	// 4. Format-Specific Adaptive Target-Size Optimization
	if format == "png" {
		// PNG is lossless: binary search scale factor to find the highest resolution <= targetSize
		fullBytes, err := encodeImage(img, "png", 0)
		if err == nil && len(fullBytes) <= targetSizeBytes {
			return fullBytes, nil
		}
		if err == nil {
			bestCandidate = fullBytes
		}

		lowScale := 0.05
		highScale := 0.95

		for i := 0; i < 8; i++ {
			midScale := (lowScale + highScale) / 2.0
			targetW := int(float64(origW) * midScale)
			targetH := int(float64(origH) * midScale)
			if targetW < minDimension || targetH < minDimension {
				break
			}

			scaledImg := resizeBilinear(img, targetW, targetH)
			encoded, encErr := encodeImage(scaledImg, "png", 0)
			if encErr != nil {
				break
			}

			if len(encoded) <= targetSizeBytes {
				bestCandidate = encoded
				lowScale = midScale + 0.02 // try higher resolution
			} else {
				highScale = midScale - 0.02 // reduce resolution
				if bestCandidate == nil || len(encoded) < len(bestCandidate) {
					bestCandidate = encoded
				}
			}

			if highScale < lowScale {
				break
			}
		}
	} else {
		// JPEG or WebP: Lossy quality binary search with adaptive resolution downscaling
		scale := 1.0

		for scale >= 0.05 {
			targetW := int(float64(origW) * scale)
			targetH := int(float64(origH) * scale)
			if targetW < minDimension || targetH < minDimension {
				break
			}

			var currentImg image.Image = img
			if scale < 0.99 {
				currentImg = resizeBilinear(img, targetW, targetH)
			}

			// Binary search quality between 5 and 95
			lowQ := 5
			highQ := 95
			var scaleBest []byte

			for i := 0; i < 7; i++ {
				midQ := (lowQ + highQ) / 2
				encoded, encErr := encodeImage(currentImg, format, midQ)
				if encErr != nil {
					break
				}

				if len(encoded) <= targetSizeBytes {
					scaleBest = encoded
					lowQ = midQ + 1 // try better quality
				} else {
					highQ = midQ - 1 // decrease quality
					if bestCandidate == nil || len(encoded) < len(bestCandidate) {
						bestCandidate = encoded
					}
				}

				if highQ < lowQ {
					break
				}
			}

			if scaleBest != nil {
				bestCandidate = scaleBest
				break // Found ideal quality that fits target size at this resolution
			}

			// If even lowest quality exceeds target size, reduce dimension scale
			minQEncoded, encErr := encodeImage(currentImg, format, 5)
			if encErr == nil && len(minQEncoded) > targetSizeBytes {
				ratio := float64(targetSizeBytes) / float64(len(minQEncoded))
				estReduction := math.Max(0.2, math.Min(0.85, math.Sqrt(ratio)*0.95))
				scale *= estReduction
			} else {
				scale *= 0.75
			}
		}
	}

	if bestCandidate != nil {
		return bestCandidate, nil
	}

	// Final fallback: lowest quality / scale
	scaledImg := resizeBilinear(img, int(math.Max(float64(minDimension), float64(origW)*0.2)), int(math.Max(float64(minDimension), float64(origH)*0.2)))
	fallback, err := encodeImage(scaledImg, format, 10)
	if err == nil {
		return fallback, nil
	}

	return input, nil
}

// CompressImage preserves backward compatibility with direct quality compression.
func CompressImage(input []byte, quality int) ([]byte, error) {
	if quality < 1 || quality > 100 {
		return nil, fmt.Errorf("quality must be between 1 and 100")
	}

	if cfg, _, err := image.DecodeConfig(bytes.NewReader(input)); err == nil {
		if int64(cfg.Width)*int64(cfg.Height) > MaxMegaPixels {
			return nil, fmt.Errorf("image exceeds maximum limit of 25 megapixels (%dx%d = %d MP)", cfg.Width, cfg.Height, (int64(cfg.Width)*int64(cfg.Height))/1_000_000)
		}
	}

	img, format, err := image.Decode(bytes.NewReader(input))
	if err != nil {
		return nil, fmt.Errorf("failed to decode image: %w", err)
	}

	bounds := img.Bounds()
	if int64(bounds.Dx())*int64(bounds.Dy()) > MaxMegaPixels {
		return nil, fmt.Errorf("image exceeds maximum limit of 25 megapixels (%dx%d)", bounds.Dx(), bounds.Dy())
	}

	return encodeImage(img, format, quality)
}
