import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Eliminar la cookie de autenticación
    response.cookies.set({
      name: 'admin-auth',
      value: '',
      expires: new Date(0), // Fecha en el pasado para eliminar la cookie
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Error during logout:', error);
    return new NextResponse(
      JSON.stringify({ success: false, error: 'Error during logout' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
