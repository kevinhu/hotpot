from functools import reduce
from hashlib import md5
from pathlib import Path

import requests
import tqdm
from tqdm import tqdm

COMPLEVEL = 9
COMPLIB = "bzip2"


class bcolors:
    HEADER = "\033[95m"
    OKBLUE = "\033[94m"
    OKGREEN = "\033[92m"
    WARNING = "\033[93m"
    FAIL = "\033[91m"
    ENDC = "\033[0m"
    BOLD = "\033[1m"
    UNDERLINE = "\033[4m"


def file_exists(file_path):
    """

    Check if a file exists.

    Args:
        file_path (str): path to the file

    """

    return Path(file_path).is_file()


def download_from_url(url, output_path, overwrite=False):

    """
    Download a file from a URL.

    Shows progress bar and checks md5sum. Also 
    checks if file is already downloaded.

    Args:
        url: string
            URL to download from
        output_path: string
            path to save the output to
        overwrite: boolean
            whether or not to overwrite the file if it already exists
        is_retry:
            whether or not the download is a retry (if the md5sum)
            does not match, is called again

    Returns:
        True if download was successful, False otherwise

    """

    output_filename = Path(output_path).name
    output_filename_bold = f"{bcolors.BOLD}{output_filename}{bcolors.ENDC}"

    if file_exists(output_path) and not overwrite:

        return True

    print(f"Downloading {url}")

    r = requests.get(url, stream=True)

    total_size = int(r.headers.get("content-length", 0))
    block_size = 1024

    t = tqdm(total=total_size, unit="iB", unit_scale=True)

    with open(output_path, "wb") as f:
        for data in r.iter_content(block_size):
            t.update(len(data))
            f.write(data)

    t.close()

    if total_size not in (0, t.n):
        print("Download error: sizes do not match")

        return False

    return True
