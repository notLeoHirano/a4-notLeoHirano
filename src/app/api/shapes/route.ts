import { NextResponse } from "next/server";
import mongooseConn from "@/lib/mongoconnect";
import { connection } from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Shape from "@/models/shape";

export async function GET() {
  try {
    await mongooseConn;

    if (!mongooseConn) {
      throw new Error("Database connection not available");
    }

    const shapesCollection = mongooseConn.collection("shapes");
    const shapes = await shapesCollection.find({}).toArray();

    return NextResponse.json(shapes);
  } catch (error) {
    console.error("Error fetching shapes:", error);
    return NextResponse.json({ error: "Error fetching shapes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await mongooseConn;

    if (!mongooseConn) {
      throw new Error("Database connection not available");
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.name) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const { shapeName, shape, description } = await req.json();
    const userName = session.user.name;
    const selfTitled = userName.toLowerCase() === shapeName.toLowerCase();

    const shapesCollection = mongooseConn.collection("shapes");
    const newShape = { userName, shapeName, shape, description, selfTitled };
    await shapesCollection.insertOne(newShape);

    return NextResponse.json({ message: "Shape submitted successfully!" });
  } catch (error) {
    console.error("Error submitting shape:", error);
    return NextResponse.json({ error: "Error submitting shape" }, { status: 400 });
  }
}
