class EmployeeDto {
    id;
    phone;
    name;
    avatar;
    activated;
    createdAt;

    constructor(Employee) {
        this.id = Employee._id;
        this.phone = Employee.phone;
        this.name = Employee.name;
        this.avatar = Employee.avatar;
        this.activated = Employee.activated;
        this.createdAt = Employee.createdAt;
    }
}

module.exports = EmployeeDto;