import fitz  # PyMuPDF
import os
from PIL import Image
from io import BytesIO

def pdf_to_split_pngs(pdf_path, output_dir, max_height=1540, scale=1.8):
    os.makedirs(output_dir, exist_ok=True)
    filename = os.path.basename(pdf_path)
    doc = fitz.open(pdf_path)

    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        mat = fitz.Matrix(scale, scale)  # scale up for better readability
        pix = page.get_pixmap(matrix=mat)
        img_data = pix.tobytes("png")

        # Load into PIL to split
        image = Image.open(BytesIO(img_data))
        width, height = image.size

        # Split if height > max_height
        num_slices = (height + max_height - 1) // max_height  # ceil
        for i in range(num_slices):
            top = i * max_height
            bottom = min((i + 1) * max_height, height)
            cropped = image.crop((0, top, width, bottom))

            output_path = os.path.join(
                output_dir, f"{filename}_page_{page_num + 1}_part_{i + 1}.png"
            )
            cropped.save(output_path)
            print(f"Saved: {output_path} ({cropped.width}x{cropped.height})")

    doc.close()

if __name__ == "__main__":
    pdf_path = "./files/WA PPA GIA Manual 8-15-24.pdf"
    output_dir = "output_images"
    pdf_to_split_pngs(pdf_path, output_dir)