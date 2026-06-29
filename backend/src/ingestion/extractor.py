from pypdf import PdfReader
from PIL import Image
from dataclasses import dataclass
import numpy as np
import io

@dataclass
class ExtractedText:
    text: str
    page: int

@dataclass
class ExtractedImage:
    image: Image.Image
    page: int
    index: int

@dataclass
class ExtractedData:
    texts: list[ExtractedText]
    images: list[ExtractedImage]

class BaseExtractor:
    def __init__(self, config):
        self.config = config

    def extract(self, file_path: str) -> ExtractedData:
        # It provides synchronous blocking method
        raise NotImplementedError("Subclasses must implement this method")
    


class PDFExtractor(BaseExtractor):
    def extract(self, file_path: str) -> ExtractedData:
        reader = PdfReader(file_path)
        texts, images = [], []

        for page in reader.pages:
            # Extract text
            text = page.extract_text()
            if text:
                texts.append(
                    ExtractedText(
                        text=text, 
                        page=reader.pages.index(page) + 1
                    )
                )

        for page_number, page in enumerate(reader.pages, start=1):
            resources = page.get("/Resources")
            if resources and "/XObject" in resources:
                xObject = resources["/XObject"].get_object()
                for img_index, obj_name in enumerate(xObject):
                    obj = xObject[obj_name]
                    if obj.get("/Subtype") == "/Image":
                        try:
                            img_data = obj.get_data()
                            img = Image.open(io.BytesIO(img_data))

                            # Ensure RGB
                            if img.mode != "RGB":
                                img = img.convert("RGB")

                            # Force proper HxWxC shape if it's a NumPy array
                            img_array = np.array(img)
                            if img_array.ndim == 2:  # grayscale
                                img_array = np.stack([img_array]*3, axis=-1)
                                img = Image.fromarray(img_array)
                            elif img_array.shape[0] == 1:  # singleton first dim
                                img_array = img_array.squeeze(0)
                                img = Image.fromarray(img_array)

                            images.append(
                                ExtractedImage(
                                    image=img,
                                    page=page_number,
                                    index=img_index
                                )
                            )
                        except Exception as e:
                            print(f"️Skipped image on page {page_number}: {e}")
                            continue
        return ExtractedData(texts=texts, images=images)

class WordExtractor(BaseExtractor):
    def extract(self, file_path: str) -> ExtractedData:
        # TODO: Implement Word document extraction
        raise NotImplementedError("Word document extraction is not implemented yet")

class ImageExtractor(BaseExtractor):
    def extract(self, file_path: str) -> ExtractedData:
        # TODO: Implement image extraction logic
        raise NotImplementedError("Image extraction is not implemented yet")