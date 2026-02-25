import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  const { name, email, password, role } = body;

  if (!name || !email || !password || !role) {
    return NextResponse.json(
      { message: "All fields are required" },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      message: "User registered successfully",
      user: {
        name,
        email,
        role,
      },
    },
    { status: 201 }
  );
}