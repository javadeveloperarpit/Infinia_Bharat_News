import { NextResponse } from "next/server";

import {
  getCategories,
} from "@/services/public/category.public.service";

export async function GET() {
  try {
    const categories =
      await getCategories();

    return NextResponse.json(categories);
  } catch (error) {
    console.error(
      "Public Categories API Error:",
      error
    );

    return NextResponse.json(
      {
        message: "Failed to load categories",
      },
      {
        status: 500,
      }
    );
  }
}