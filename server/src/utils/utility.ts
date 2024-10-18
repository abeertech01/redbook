class ErrorHandler extends Error {
  statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode

    // Set the prototype explicitly for better compatibility with built-in Error
    Object.setPrototypeOf(this, ErrorHandler.prototype)
  }
}

export { ErrorHandler }
