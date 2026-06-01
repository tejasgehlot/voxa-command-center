package com.voxa.security;

import com.voxa.entity.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Getter
public class CustomUserDetails implements UserDetails {

    private final UUID   userId;
    private final String email;
    private final String password;
    private final String role;
    private final Integer wardId;
    private final String department;
    private final boolean active;

    public CustomUserDetails(User user) {
        this.userId     = user.getId();
        this.email      = user.getEmail();
        this.password   = user.getPasswordHash();
        this.role       = user.getRole().name();
        this.wardId     = user.getWard() != null ? user.getWard().getId() : null;
        this.department = user.getDepartment();
        this.active     = user.getActive();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override public String getPassword()   { return password; }
    @Override public String getUsername()   { return email; }
    @Override public boolean isAccountNonExpired()   { return true; }
    @Override public boolean isAccountNonLocked()    { return active; }
    @Override public boolean isCredentialsNonExpired(){ return true; }
    @Override public boolean isEnabled()             { return active; }
}