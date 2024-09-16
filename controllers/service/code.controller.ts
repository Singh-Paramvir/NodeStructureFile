import { hash, hashSync } from 'bcryptjs';
import { Request, Response } from 'express';
let referralCodeGenerator = require('referral-code-generator');
var otpGenerator = require('otp-generator');
const QRCode = require('qrcode');
const multer = require('multer');
var nodemailer = require('nodemailer');


import { v4 as uuidv4 } from "uuid";

import bcryptjs = require("bcryptjs");
bcryptjs.genSalt(10, function (err, salt) {
    bcryptjs.hash("B4c0/\/", salt, function (err, hash) {
        // Store hash in your password DB.
    });
});


// var bcryptjs= require('bcryptjs');

import db from "../../models"
const MyQuery = db.sequelize;
const { QueryTypes } = require('sequelize');
const { SECRET_KEY } = require('../../appconfig')
const jwt = require('jsonwebtoken')
import commonController from '../common/common.controller';
import { body, Result } from 'express-validator';
import { exists } from 'fs';
import { Encrypt } from '../common/encryptpassword';
import { error } from 'console';
import { TokenExpiredError } from 'jsonwebtoken';
import { createWorker, Worker } from 'tesseract.js';
const Tesseract = require('tesseract.js');

class CodeController {

    ///Section User Start

    async  addNewUser(payload: any, res: Response) {
       try{
        const {firstname,password,email } = payload;
        console.log(payload,"pauy");
        
        let check = await db.Users.findOne({
            where:{
               email
            }
        })

        if(check){
            if(check.password == password){
                const token = jwt.sign({
                    id: check.id,
                    email:check.email,
                }, process.env.TOKEN_SECRET);
              commonController.successMessage({check,token},"User login",res)
            }else{
                commonController.errorMessage("wrong password",res)
            }
            
        }else{
            let createUser = await db.Users.create({
                firstname,email,password 
            })
            const token = jwt.sign({
                id: createUser.id,
                email:createUser.email,
            }, process.env.TOKEN_SECRET);
            commonController.successMessage({createUser,token},"user created",res)
        }

       }catch(e){
        console.log(e)
       }
    }
    async verify(payload: any, res: Response) {
        try {
            const { email, otp } = payload;
            var sun = await db.Users.findOne({
                where: {
                    email
                }
            })
            console.log(sun.id, "ss")
            var checkOtp = await db.UserOtps.findOne({
                where: {
                    userId: sun.id,
                    active: true

                }
            })
            console.log(checkOtp, "ss")
            if (checkOtp) {
                if (checkOtp.otpValue == otp) {

                    await checkOtp.update({ active: false });
                    commonController.successMessage({}, "Otp Verified", res)

                } else {
                    commonController.errorMessage("Invalid OTP", res)
                }
            }
        } catch (e) {
            commonController.errorMessage;
        }
    }
    // login user

    async loginUser(payload: any, res: Response) {
        const { email, password } = payload;
        console.log(payload, "pa")
        //Check If Email Exists
        var checkdata = await db.Users.findOne({
            where: {
                email

            }
        })

        if (checkdata) {
            if (await Encrypt.comparePassword(password.toString(), checkdata.password.toString())) {

                const token = jwt.sign({
                    email,
                    name: checkdata.fullName,
                    emailVerfied: checkdata.isEmailVerfied,

                }, process.env.TOKEN_SECRET);

                commonController.successMessage(token, "User login", res)
            } else {
                commonController.errorMessage("INvalid Details", res)
            }
        }
        else {
            commonController.errorMessage("Email password not match", res)
            console.log("no");


        }
    }
    // verify user

    async verifyUser(payload: any, res: Response) {
        try {
            const { id, otp } = payload;

            var checkOtp = await db.UserOtps.findOne({
                where: {
                    userId: id,
                    active: true

                }
            })

            if (checkOtp) {
                if (checkOtp.otpValue == otp) {

                    await checkOtp.update({ active: false });
                    commonController.successMessage({}, "Otp Verified", res)

                } else {
                    commonController.errorMessage("Invalid OTP", res)
                }
            }
        } catch (e) {
            commonController.errorMessage;
        }
    }

  
    // // updatePassword

    async updatePassword(payload: any, res: Response) {
        try {
            const { emailId, otp, password } = payload;
            // console.log(payload)
            var checkOtp = await db.UserOtps.findOne({
                where: {

                    otpValue: otp

                }
            })
            console.log(checkOtp.otpValue, otp);
            if (checkOtp) {
                if (checkOtp.otpValue == otp) {

                    commonController.successMessage({}, "Otp Verified", res)


                }
                else {
                    commonController.errorMessage("Invalid OTP", res)

                }
            }
        } catch (e) {
            commonController.errorMessage;
        }
    }
    // new password

    async newPassword(payload: any, res: Response) {
        const { emailId, password } = payload;
        //Check If Email Exists

        var checkdata = await db.Users.findOne({
            where: {
                emailId,



            }
        })
        console.log(emailId);
        if (checkdata) {
            var hash = await Encrypt.cryptPassword(password.toString());

            var result = await checkdata.update({

                password: hash,

            })
            commonController.successMessage(emailId, "password update  sucessfully", res)




        } else {
            commonController.errorMessage("password not update", res)
            console.log("no");
        }
    }

    // get user by id

    async getByUserId(payload: any, res: Response) {
        const { emailId } = payload;
        //Check If Email Exists
        var checkdata = await db.Users.findOne({
            where: {
                emailId

            }
        })
        if (checkdata) {
            const token = jwt.sign({
                id: checkdata.id,
                emailId,
                name: checkdata.fullName,
                emailVerfied: checkdata.isEmailVerfied,
                is2FaEnabled: checkdata.is2FaEnabled,
                isPhoneVerfied: checkdata.isPhoneVerfied
            }, process.env.TOKEN_SECRET);
            console.log(token);
            commonController.successMessage(checkdata, "data get  sucessfully", res)

            console.log(checkdata);
        } else {
            commonController.errorMessage("data not get", res)
            console.log("no");
        }
    }

    // update profile
    async updateProfile(payload: any, res: Response) {
        const { emailId, fullName, newemailId } = payload;
        //Check If Email Exists

        var checkdata = await db.Users.findOne({
            where: {
                emailId
            }
        })
        if (checkdata) {
            var result = await checkdata.update({

                fullName,
                emailId: newemailId

            })
            commonController.successMessage(checkdata, "data updated sucessfully", res)
            console.log(checkdata.emailId);
        } else {
            commonController.errorMessage("data not update", res)
            console.log("not found");
        }
    }

    // change Password

    async changePassword(payload: any, res: Response) {
        const { id, password, newPassword } = payload;
        var hash = await Encrypt.cryptPassword(password.toString());
        //Check If Email Exists
        var checkdata = await db.Users.findOne({
            where: {
                id

            }
        })

        if (checkdata) {
            console.log(checkdata);
            const check = await Encrypt.comparePassword(password.toString(), checkdata.password.toString())
            console.log(check);
            if (await Encrypt.comparePassword(password.toString(), checkdata.password.toString())) {

                var result = await checkdata.update({


                    password: newPassword

                })
                console.log(hash);
                console.log("ok ");
                commonController.successMessage(id, "Password changed successfully", res)

            } else {
                commonController.errorMessage("INvalid Details", res)
            }
        }
        else {
            commonController.errorMessage("Email password not match", res)
            console.log("no");


        }
    }
    // find all users

    async getAll(payload: any, res: Response) {

        try {
           console.log("api start");
           
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: 'paramvir@airai.games',
                  pass: 'pb12ac4705'
                }
              });
              
              var mailOptions = {
                from: 'paramvir@airai.games',
                to: 'sunnykl1233@gmail.com',
                subject: 'Sending Email using Node.js',
                text: 'That was easy!'
              };
              
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
              });
              console.log("api end");

        } catch (e) {
            console.log(e);

        }
    }


    // async test(payload: any, res: Response) {
    //     const {cc,phone}=payload;
    //     console.log(payload,"pa") 
    //     client.messages.create({
    //         body: 'Hello from Node',
    //         to: '+916284507322',
    //         from: '+12345678901'
    //      }).then(message => console.log(message))
    //        // here you can implement your fallback code
    //        .catch(error => console.log(error))

    // }


    // delete user

    async deleteUser(payload: any, res: Response) {
        const { emailId } = payload;
        //Check If Email Exists
        var checkdata = await db.Users.findOne({
            where: {
                emailId

            }
        })
        if (checkdata) {


            var result = checkdata.destroy({
                where: {
                    emailId: emailId
                }
            }).then(function (rowDeleted) { // rowDeleted will return number of rows deleted
                if (rowDeleted === 1) {
                    console.log('Deleted successfully');
                }
            }, function (err) {
                console.log(err);
            });

            commonController.successMessage(checkdata, "data delete  sucessfully", res)
            console.log("data delete  sucessfully");


        } else {
            commonController.errorMessage("data not delete", res)
            console.log("not found");
        }
    }

    //qr code 

    async qrCode(payload: any, res: Response) {
        const generateQR = async (text) => {
            try {
                const dataUrl = await QRCode.toDataURL(text);
                console.log(dataUrl);
                commonController.successMessage(dataUrl, "QR code generated successfully", res);
            } catch (e) {
                commonController.errorMessage("Failed to generate QR code", res);
                console.log(e);
            }
        };

        await generateQR("http://google.com");
    }


  
}



export default new CodeController();
// export default new hello();
