import { clerkMiddleware } from '@clerk/nextjs/server'
 
// This protects all routes except the home page
export default clerkMiddleware()

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/(api|trpc)(.*)'],
}
