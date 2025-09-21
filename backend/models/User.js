
class User {
    constructor(id, name, email, password, isAdmin = false) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.isAdmin = isAdmin;
    }

    getRole() {
        return "User";
    }

    getDetails() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            isAdmin: this.isAdmin,
            role: this.getRole()
        };
    }
}

class Admin extends User { // Inheritance
    constructor(id, name, email, password) {
        super(id, name, email, password, true);
    }

    getRole() {
        return "Admin"; // Polymorphism
    }
}

class Voter extends User { // Inheritance
    constructor(id, name, email, password) {
        super(id, name, email, password, false);
        this.hasVoted = false;
    }

    getRole() {
        return "Voter"; // Polymorphism
    }
}

module.exports = { User, Admin, Voter };
