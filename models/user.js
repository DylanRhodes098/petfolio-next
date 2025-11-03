import { Model, DataTypes } from "sequelize";
import bcrypt from "bcryptjs";
import { sequelize } from "@/lib/db";

export class User extends Model {
  toJSON() {
    const value = {...this.get()} 
    delete value.password
    return value;
    }

}

export const initUser = () => {
  // Important for hot reload //
  if (sequelize.models.User) return sequelize.models.User;

  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: { type: DataTypes.STRING, allowNull: false },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: { name: "unique_email", msg: "Email must be unique" },
      },
      avatar: DataTypes.STRING,
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { len: [8] },
      },
    },
    {
      hooks: {
        beforeCreate: async (newUserData) => {
          newUserData.password = await bcrypt.hash(newUserData.password, 10);
          return newUserData;
        },
        beforeUpdate: async (user) => {
          if (user.changed("password")) {
            if (user.password && user.password.trim() !== "") {
              user.password = await bcrypt.hash(user.password, 10);
            } else {
              // If frontend sent empty password, keep the old one
              user.password = user.previous("password");
            }
          }
        },
      },
      sequelize,
      modelName: "User",
      tableName: "users",
      underscored: false,
      timestamps: true,
    }
  );

  return User;
}
