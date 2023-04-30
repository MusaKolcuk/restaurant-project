// bu sekilde yazdigimizda kodumuzda bir hata olusuyor. Bunun sebebi ise bu sekilde yazdigimizda bu fonksiyonlarin her yerden erisilebilmesi.
//Bu yuzden bu fonksiyonlari bir obje icinde toplayip export ediyoruz.
class CustomError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}


module.exports = CustomError;