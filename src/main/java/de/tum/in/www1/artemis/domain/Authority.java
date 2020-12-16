package de.tum.in.www1.artemis.domain;

import com.fasterxml.jackson.annotation.JsonInclude;
import de.tum.in.www1.artemis.security.AuthoritiesConstants;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.util.Objects;

/**
 * An authority (a security role) used by Spring Security.
 */
@Entity
@Table(name = "jhi_authority")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class Authority implements Serializable {

    private static final long serialVersionUID = 1L;

    public Authority() {
        // empty constructor would not be available otherwise
    }

    public static Authority ADMIN_AUTHORITY = new Authority(AuthoritiesConstants.ADMIN);
    public static Authority INSTRUCTOR_AUTHORITY = new Authority(AuthoritiesConstants.INSTRUCTOR);

    public Authority(String name) {
        // we need this constructor because we use the UserDTO which maps a set of authorities to a set of strings
        setName(name);
    }

    @NotNull
    @Size(max = 50)
    @Id
    @Column(length = 50)
    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        Authority authority = (Authority) o;

        return Objects.equals(name, authority.name);
    }

    @Override
    public int hashCode() {
        return name != null ? name.hashCode() : 0;
    }

    @Override
    public String toString() {
        return "Authority{" + "name='" + name + '\'' + "}";
    }
}
