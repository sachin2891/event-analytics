// import { Types } from "mongoose";

// declare global {
//   namespace Express {
//     interface Request {
//       orgId?: Types.ObjectId;
//       projectId?: Types.ObjectId;
//     }
//   }
// }
// types/express/index.d.ts
import { ObjectId } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      orgId?: ObjectId | string;
      projectId?: ObjectId | string;
    }
  }
}
