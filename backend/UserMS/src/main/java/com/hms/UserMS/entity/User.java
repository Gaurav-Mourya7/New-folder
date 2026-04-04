package com.hms.UserMS.entity;

import com.hms.UserMS.dto.Roles;
import com.hms.UserMS.dto.UserDto;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class User {
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    private Long id;
    private String name;
    @Column(unique = true)
    private String email;
    private String password;
    @Enumerated(EnumType.STRING)
    private Roles role;
    private Long profileId;

    public UserDto toDTO() {
        return new UserDto(this.id,this.name,this.email,this.password,this.role,this.profileId);
    }
}
