/**
 * Mongoose model User.
 *
 * @author Maria Fredriksson
 * @version 1.0.0
 */

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

// Create a schema.
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    maxLength: 50,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    minLength: [10, 'Too short password - Minimun length: 10 characters.'],
    maxLength: [1000, 'The password cannot be more than 1000 characters long.'],
    required: true
  }
}, {
  timestamps: true,
  versionKey: false
})

// Salts and hashes password before save
// Important that this is done before the model is created!
userSchema.pre('save', async function () {
  this.password = await bcrypt.hash(this.password, 8)
})

/**
 * Authenticates a user with the given `username` and `password`.
 *
 * @param {string} username - The username to search for.
 * @param {string} password - The password to verify.
 * @throws {Error} If no user was found with the given `username`, or if the password is incorrect.
 * @returns {object} The authenticated user.
 */
userSchema.statics.authenticate = async function (username, password) {
  const user = await this.findOne({ username })

  // If no user found or password is wrong, throw an error
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Invalid login attempt')
  }

  // Else (if user was found and password was correct), return the user
  return user
}

// Create a model using the schema.
export const User = mongoose.model('User', userSchema)
