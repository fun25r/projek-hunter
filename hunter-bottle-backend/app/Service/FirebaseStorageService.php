<?php

namespace App\Service;

use Google\Cloud\Storage\StorageClient;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

class FirebaseStorageService
{
    private StorageClient $storage;
    private string $bucketName;

    public function __construct()
    {
        $credentialsPath = config('filesystems.disks.firebase.credentials_path');

        if (!file_exists($credentialsPath)) {
            throw new \RuntimeException(
                'Firebase Service Account JSON tidak ditemukan di: ' . $credentialsPath . "\n" .
                'Download dari Firebase Console > Project Settings > Service Accounts > Generate new private key.'
            );
        }

        $this->storage = new StorageClient([
            'keyFilePath' => $credentialsPath,
        ]);

        $this->bucketName = config('filesystems.disks.firebase.bucket');
    }

    /**
     * Upload file ke Firebase Storage dan dapatkan URL publik.
     */
    public function upload(UploadedFile $file, string $folder = 'products'): string
    {
        $bucket = $this->storage->bucket($this->bucketName);

        $filename = $folder . '/' . uniqid() . '_' . time() . '.' . $file->getClientOriginalExtension();

        $bucket->upload(
            $file->getContent(),
            [
                'name' => $filename,
                'predefinedAcl' => 'publicRead',
                'metadata' => [
                    'contentType' => $file->getMimeType(),
                ],
            ]
        );

        $publicUrl = sprintf(
            'https://storage.googleapis.com/%s/%s',
            $this->bucketName,
            $filename
        );

        Log::info('Firebase Storage: file uploaded', [
            'path' => $filename,
            'url'  => $publicUrl,
        ]);

        return $publicUrl;
    }

    /**
     * Hapus file dari Firebase Storage berdasarkan URL publik.
     */
    public function deleteByUrl(?string $publicUrl): void
    {
        if (!$publicUrl) return;

        $bucket = $this->storage->bucket($this->bucketName);

        $prefix = sprintf('https://storage.googleapis.com/%s/', $this->bucketName);

        if (str_starts_with($publicUrl, $prefix)) {
            $path = substr($publicUrl, strlen($prefix));
            $object = $bucket->object($path);

            if ($object->exists()) {
                $object->delete();
                Log::info('Firebase Storage: file deleted', ['path' => $path]);
            }
        }
    }
}
