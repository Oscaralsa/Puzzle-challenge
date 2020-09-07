import { decodeToken, Payload } from "../../services/jwtService"
import moment from "moment";

const verifyUser = async (req: any) => {
  try {
    const bearerHeader: string = req.headers.authorization;

    if (bearerHeader) {
      const token: string = bearerHeader.split(' ')[1];
      const payload: Payload = decodeToken(token);

      //Check if token is expired after 3 hours
      const currentDate = moment().unix();

      if (currentDate < payload.exp){
        req.email = payload.email;
        req.loggedInUserId = payload.id;
      } else {
        throw new Error("Token expired");
      }

    } else {
      throw new Error("Missing token");
    }

  } catch (err) {
    throw new Error(err);
  }
}

export = verifyUser;