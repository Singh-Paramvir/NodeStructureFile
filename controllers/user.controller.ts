import { Request, Response } from 'express';
import codeController from './service/code.controller';
import commonController from './common/common.controller';
import { sign, verify } from 'crypto';
// import userController from "../controllers/user.controller";
import db from '../models';
class UserController {
    async register(req: Request, res: Response) {
        try {
            const {firstname,password,email } = req.body;
          

                await codeController.addNewUser({
                    firstname,password,email
                }, res)
            


        } catch (e) {
            console.log(e)
            commonController.errorMessage("user not register", res)
        }
    }
    async verify(req: Request, res: Response) {
        try {
            const {email,otp} = req.body;
            console.log(req.body)
          

                await codeController.verify({
                    email,otp
                }, res)
            


        } catch (e) {
            console.log(e)
            commonController.errorMessage("user not register", res)
        }
    }
    //  user login

    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            await codeController.loginUser({
                email, password

            }, res)
        } catch (e) {
            commonController.errorMessage("user not login", res)

        }
    }

    //verify user
    async verifyCode(req: Request, res: Response) {
        try {
            var userId=req?.user?.id;
            const {  otp } = req.body;
            await codeController.verifyUser({
               userId, otp

            }, res)
        } catch (e) {
            commonController.errorMessage("not verify", res)

        }
    }
    
  

    //updatePassword
    async updatePassword(req: Request, res: Response) {
        try {
            const {  emailId,otp, password, confirmPassword } = req.body;
            if (password != confirmPassword) {
                commonController.errorMessage("Password Not Matched", res);
               
            }
           
            else {

                await codeController.updatePassword({
                     emailId,otp,password
                }, res)
            }


        } catch (e) {
            console.log(e)
            commonController.errorMessage("user not update", res)
        }
    }

//

async newPassword(req: Request, res: Response) {
    try {
        const { emailId, password, confirmPassword } = req.body;
        if (password != confirmPassword) {
            commonController.errorMessage("Password Not Matched", res);
           
        }
       
        else {

            await codeController.newPassword({
                 emailId, password
            }, res)
        }


    } catch (e) {
        console.log(e)
        commonController.errorMessage("not update", res)
    }
} 
  // Get User By Id
  
  async getByUserId(req: Request, res: Response) {
    try {
        const { emailId } = req.body;
        await codeController.getByUserId({
            emailId

        }, res)
    } catch (e) {
        commonController.errorMessage("user not get", res)
        console.log(e);

    }
}
  // update profile
  
  async updateProfile(req: Request, res: Response) {
    try {
        const { emailId,fullName ,newemailId} = req.body;
        await codeController.updateProfile({
            emailId,
            fullName,
            newemailId

        }, res)
    } catch (e) {
        commonController.errorMessage("user not get", res)
        console.log(e);

    }
}

// change Password
async changePassword(req: Request, res: Response) {
    try {
        const { id, password ,newPassword} = req.body;
        await codeController.changePassword({
            id, password,newPassword

        }, res)
    } catch (e) {
        commonController.errorMessage("user not login", res)

    }
}
// get all users
async getAll(req: Request, res: Response) {
    
    try {
        
        await codeController.getAll({
           

        }, res)
    } catch (e) {
        commonController.errorMessage("user not get", res)
        console.log(e);

    }
}
// async test(req: Request, res: Response) {
    
//     try {
//          const{cc,phone}=req.body;
//         await codeController.test({
//            cc,phone

//         }, res)
//     } catch (e) {
//         commonController.errorMessage("user not get", res)
//         console.log(e);

//     }
// }
      // delete user
    
      async deleteUser(req: Request, res: Response) {
        try {
            const { emailId } = req.body;
            await codeController.deleteUser({
                emailId
    
            }, res)
        } catch (e) {
            commonController.errorMessage("user not found", res)
            console.log(e);
    
        }
    }

    //qr code

    async qrCode(req: Request, res: Response) {
        try {
           
            await codeController.qrCode({
            
    
            }, res)
        } catch (e) {
            commonController.errorMessage("qr code is not found", res)
            console.log(e);
    
        }
    }

    //IMAGE UPLOAD
    async postImage(req, res) {
        try {
           console.log(req.body, ";l;l;l");
           console.log(req.file, ";l;l;l");
          
          var response = `${req.file.path}`;
          console.log(response, "?>?>");
      
          if (response.match(/\.(png|jpg|jpeg)$/)) {
            let x = await db.avatars.create(
              {
                avatar: "http://192.168.0.101:4000/" + response,
              },
              res
            );
            commonController.successMessage(x.avatar, "", res);
      
          } else {
            commonController.errorMessage(
              "Please upload png and jpg image file",
              res
            );
          }
      
        } catch (e) {
          commonController.errorMessage("qr code is not found", res)
          console.log(e);
      
        }
      }
      
}


export default new UserController();