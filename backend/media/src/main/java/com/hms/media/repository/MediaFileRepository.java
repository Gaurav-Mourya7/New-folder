package com.hms.media.repository;

import com.hms.media.entity.MediaFile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MediaFileRepository extends JpaRepository<MediaFile,Long> {
}
