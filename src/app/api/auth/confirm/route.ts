import { type EmailOtpType } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      // Return a success page, so the user knows it worked immediately 
      // instead of magically redirecting them somewhere unexpected.
      return new NextResponse(
        `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Confirmed - EduHub UG</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    background-color: #F5F7FA;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                }
                .container {
                    background: white;
                    padding: 40px;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    text-align: center;
                    max-width: 400px;
                }
                .icon {
                    color: #00C853;
                    font-size: 48px;
                    margin-bottom: 20px;
                }
                h1 {
                    color: #1A1A2E;
                    margin: 0 0 10px 0;
                }
                p {
                    color: #888888;
                    margin: 0 0 30px 0;
                    line-height: 1.5;
                }
                a {
                    background-color: #2979FF;
                    color: white;
                    text-decoration: none;
                    padding: 12px 24px;
                    border-radius: 20px;
                    font-weight: bold;
                    display: inline-block;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="icon">✓</div>
                <h1>Email Confirmed!</h1>
                <p>Welcome to EduHub UG. Your email has been successfully verified.</p>
                <a href="${next}">Continue to Website</a>
            </div>
        </body>
        </html>`,
        {
          headers: { 'Content-Type': 'text/html' }
        }
      )
    }
  }

  // Handle error cases
  return new NextResponse(
    `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmation Error - EduHub UG</title>
        <style>
            body { font-family: sans-serif; text-align: center; padding-top: 100px; background-color: #F5F7FA; color: #1A1A2E; }
            .container { background: white; padding: 40px; border-radius: 12px; max-width: 400px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            h1 { color: #d32f2f; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Error Confirming Email</h1>
            <p>The verification link may be expired or invalid. Please try registering or logging in again to request a new link.</p>
        </div>
    </body>
    </html>`,
    {
      headers: { 'Content-Type': 'text/html' },
      status: 400
    }
  )
}
