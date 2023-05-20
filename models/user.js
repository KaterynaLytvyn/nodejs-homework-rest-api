const { Schema, model} = require('mongoose');
const Joi = require('joi');

const userSchema = Schema({
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
    },
    subscription: {
      type: String,
      enum: ["starter", "pro", "business"],
      default: "starter"
    },
    avatarURL: {
      type: String,
      required: true
    },
    token: {
      type: String,
      default: null,
    },
    verify: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      required: [true, 'Verify token is required'],
    },
  });

  const User = model("user", userSchema);

  const joiRegisterSchema = Joi.object({
    password: Joi.string().required(),
    email: Joi.string().required(), 
    subscription: Joi.string().valid("starter", "pro", "business")
  })

  const joiLoginSchema = Joi.object({
    password: Joi.string().required(),
    email: Joi.string().required()
  })

  module.exports = {
    User,
    joiRegisterSchema,
    joiLoginSchema
  }