from pathlib import Path
import httpx

def download_file(url: str, output_path: str) -> None:
    path = Path(output_path)

    with httpx.stream(
        "GET",
        url,
        follow_redirects=True,
        timeout=60.0,
    ) as response:
            response.raise_for_status()

            with path.open("wb") as f:
                for chunk in response.iter_bytes():
                    f.write(chunk)