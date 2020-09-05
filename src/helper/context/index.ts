import jwt from "../../services/jwt"

//Destructuring
const { decodeToken } = jwt;

interface Payload {
  id: number;
  email: string;
  name: string;
  createToken: number;
  exp: number;
}

const verifyUser = async (req: any) => {
  try {
    const bearerHeader: string = req.headers.authorization;

    if (bearerHeader) {
      const token: string = bearerHeader.split(' ')[1];
      const payload: Payload = decodeToken(token);
      req.email = payload.email;
      req.loggedInUserId = payload.id;
    } else {
      throw new Error("Missing token");
    }
    
  } catch (err) {
    throw new Error("Invalid token");
  }
}

export = verifyUser;