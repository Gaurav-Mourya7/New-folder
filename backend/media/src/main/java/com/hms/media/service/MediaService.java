package com.hms.media.service;

import com.hms.media.dto.MediaFileDto;
import com.hms.media.entity.MediaFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

public interface MediaService {

    MediaFileDto storeFile(MultipartFile file) throws IOException;

    public Optional<MediaFile> getFile(Long id);

}