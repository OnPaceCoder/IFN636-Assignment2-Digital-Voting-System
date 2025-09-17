
class User {
    constructor(id, name, email, password, isAdmin = false) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.isAdmin = isAdmin;
    }

    getRole() {
        return "User"; // Polymorphism
    }
}

class Admin extends User {
    constructor(id, name, email, password) {
        super(id, name, email, password, true);
    }

    getRole() {
        return "Admin"; // Polymorphism
    }
}

class Voter extends User {
    constructor(id, name, email, password) {
        super(id, name, email, password, false);
        this.hasVoted = false; // Encapsulation
    }

    getRole() {
        return "Voter";
    }
}

module.exports = { User, Admin, Voter };
