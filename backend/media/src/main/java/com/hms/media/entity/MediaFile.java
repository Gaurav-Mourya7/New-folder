package com.hms.media.entity;

import com.hms.media.dto.Storage;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;


import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Builder
public class MediaFile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String type;
    private Long size;
    @Lob
    private byte[] data;
    private Storage storage;
    @CreationTimestamp
    private LocalDateTime createdAt;

//    public MediaFile setName(String name) {
//        this.name = name;
//        return this;
//    }
//    public MediaFile setType(String type) {
//        this.type = type;
//        return this;
//    }
//    public MediaFile build(){
//        return this;
//    }
//    public void getObj(){
//        MediaFile.builder().name("Jdjd").type("image.png").build();
//    }
}
