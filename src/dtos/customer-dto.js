class CustomerDto {
    id;
    phone;
    name;
    avatar;
    activated;
    createdAt;

    constructor(customer) {
        this.id = customer._id;
        this.phone = customer.phone;
        this.name = customer.name;
        this.avatar = customer.avatar;
        this.activated = customer.activated;
        this.createdAt = customer.createdAt;
    }
}

module.exports = CustomerDto;