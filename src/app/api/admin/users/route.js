import { NextResponse } from "next/server";
import { getUsers, saveUser, deleteUser } from "@/lib/db";

// Helper to verify if the requester is an admin
async function verifyAdmin(req) {
  const adminEmail = req.headers.get("x-admin-email");
  if (!adminEmail) return false;

  const users = await getUsers();
  const user = users.find(u => u.email.toLowerCase() === adminEmail.toLowerCase());
  return user && user.isAdmin;
}

export async function GET(req) {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const users = await getUsers();
    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("Admin Users GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { email, password, name, roles, isAdmin: makeAdmin } = body;

    if (!email || !password || !roles) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const saved = await saveUser({
      email: email.toLowerCase().trim(),
      password,
      name: name || email.split("@")[0],
      roles: Array.isArray(roles) ? roles : [roles],
      isAdmin: !!makeAdmin
    });

    return NextResponse.json({ success: true, user: saved });
  } catch (error) {
    console.error("Admin Users POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (email.toLowerCase() === "pa2@skillizee.io") {
      return NextResponse.json({ error: "Cannot delete system administrator" }, { status: 400 });
    }

    await deleteUser(email);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin Users DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
