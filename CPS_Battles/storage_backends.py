from storages.backends.azure_storage import AzureStorage
import os

class MediaStorage(AzureStorage):
    account_name = "cpsbattlesstorage"
    account_key = os.environ.get("STORAGE_KEY")
    azure_container = "media"
    expiration_secs = None
