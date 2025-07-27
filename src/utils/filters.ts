import { Request } from "express";

export function buildMatchFilter(req: Request) {
  const filter: any = {
    orgId: (req as any).orgId, // manually attached via middleware
    projectId: (req as any).projectId,
  };

  const allowedProps = ["country", "device", "browser", "page"];

  allowedProps.forEach((key) => {
    if (req.query[key]) {
      filter[`properties.${key}`] = req.query[key];
    }
  });

  return filter;
}
