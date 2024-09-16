'use strict';
import {
  Model
}  from 'sequelize';
interface UserAttributes{
senderSocketId:string,
receiverSocketId:string,
message:string


}
module.exports = (sequelize:any, DataTypes:any) => {
  class  Message extends Model<UserAttributes>
  implements UserAttributes {
    senderSocketId!:string;
    receiverSocketId!:string;
    message!:string
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Message.init({
    senderSocketId:{type:DataTypes.STRING},
    receiverSocketId:{type:DataTypes.STRING},
    message:{type:DataTypes.STRING}
 
  }, {
    sequelize,
    modelName: 'Messages',
  });
  return  Message;
};
