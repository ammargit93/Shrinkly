package main

import (
	"archive/zip"
	"bytes"
	"fmt"
	"io"
	"log"
	"strconv"

	"shrinkly/compressor"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
)

const (
	MaxBatchFiles = 10
	MaxFileSize   = 10 * 1024 * 1024 // 10 MB per image
	MaxBodyLimit  = 25 * 1024 * 1024 // 25 MB max request body limit
)

func main() {
	app := fiber.New(fiber.Config{
		BodyLimit: MaxBodyLimit,
	})

	// Enable CORS for cross-origin frontend requests
	app.Use(cors.New(cors.Config{
		AllowOrigins: []string{"*"},
		AllowHeaders: []string{"Origin, Content-Type, Accept, Authorization"},
		AllowMethods: []string{"GET, POST, OPTIONS"},
	}))

	app.Get("/", func(c fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "healthy",
			"service": "Shrinkly Backend",
			"limits": fiber.Map{
				"max_batch_images": MaxBatchFiles,
				"max_file_size_mb": 10,
				"max_megapixels":   25,
			},
		})
	})

	app.Post("/api/batch", func(c fiber.Ctx) error {
		form, err := c.MultipartForm()
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Failed to parse multipart form data. Please ensure you are uploading files.",
			})
		}

		files := form.File["file"]
		if len(files) == 0 {
			files = form.File["files"]
		}

		// Validate batch size (1 to 10 images)
		if len(files) == 0 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "No images provided. Please select between 1 and 10 images.",
			})
		}

		if len(files) > MaxBatchFiles {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": fmt.Sprintf("Batch limit exceeded: maximum %d images allowed per request (received %d).", MaxBatchFiles, len(files)),
			})
		}

		// Target size in KB (default 100 KB)
		targetSizeKb := 100
		if tStr := c.FormValue("target_size_kb"); tStr != "" {
			if t, err := strconv.Atoi(tStr); err == nil && t > 0 {
				targetSizeKb = t
			}
		} else if tStr := c.FormValue("targetSizeKb"); tStr != "" {
			if t, err := strconv.Atoi(tStr); err == nil && t > 0 {
				targetSizeKb = t
			}
		}

		log.Printf("Starting sequential batch compression: %d files, targetSizeKb=%d", len(files), targetSizeKb)

		var zipBuffer bytes.Buffer
		zipWriter := zip.NewWriter(&zipBuffer)

		// Process images sequentially to keep peak RAM low (Render 512 MB tier)
		for idx, file := range files {
			log.Printf("[%d/%d] Compressing %s to <= %d KB (original size: %d bytes)", idx+1, len(files), file.Filename, targetSizeKb, file.Size)

			// 1. Validate file size limit (10 MB per image)
			if file.Size > MaxFileSize {
				zipWriter.Close()
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": fmt.Sprintf("File '%s' exceeds the 10 MB maximum size limit (%0.2f MB).", file.Filename, float64(file.Size)/(1024*1024)),
				})
			}

			// 2. Open file stream
			src, err := file.Open()
			if err != nil {
				zipWriter.Close()
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": fmt.Sprintf("Failed to open uploaded file '%s'.", file.Filename),
				})
			}

			// 3. Read input bytes and immediately close stream
			inputBytes, err := io.ReadAll(src)
			src.Close()
			if err != nil {
				zipWriter.Close()
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": fmt.Sprintf("Failed to read file data for '%s'.", file.Filename),
				})
			}

			// 4. Compress image to strictly hit target size limit
			compressedBytes, err := compressor.CompressImageToLimit(inputBytes, targetSizeKb)
			inputBytes = nil // Release raw input buffer immediately for GC
			if err != nil {
				zipWriter.Close()
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": fmt.Sprintf("Compression error for '%s': %s", file.Filename, err.Error()),
				})
			}

			// 5. Add compressed image entry to ZIP archive
			writer, err := zipWriter.Create(file.Filename)
			if err != nil {
				zipWriter.Close()
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": fmt.Sprintf("Failed to create zip entry for '%s'.", file.Filename),
				})
			}

			if _, err := writer.Write(compressedBytes); err != nil {
				zipWriter.Close()
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": fmt.Sprintf("Failed to write '%s' into zip archive.", file.Filename),
				})
			}

			log.Printf("[%d/%d] Successfully compressed %s -> %d bytes (<= %d KB)", idx+1, len(files), file.Filename, len(compressedBytes), targetSizeKb)
			compressedBytes = nil // Release compressed output buffer immediately for GC
		}

		// 6. Ensure ZIP writer is properly closed before returning response
		if err := zipWriter.Close(); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to finalize compressed ZIP archive.",
			})
		}

		c.Set("Content-Type", "application/zip")
		c.Set("Content-Disposition", `attachment; filename="compressed_images.zip"`)
		return c.Send(zipBuffer.Bytes())
	})

	log.Println("Shrinkly backend listening on :8080")
	log.Fatal(app.Listen(":8080"))
}
