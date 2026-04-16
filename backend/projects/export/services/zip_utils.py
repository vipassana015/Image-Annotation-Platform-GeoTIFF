import os
import zipfile

def create_zip(folder_path):
    zip_path = f"{folder_path}.zip"

    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(folder_path):
            for file in files:
                full_path = os.path.join(root, file)

                # maintain folder structure inside zip
                relative_path = os.path.relpath(full_path, folder_path)

                zipf.write(full_path, relative_path)

    return zip_path