"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Shield, Stethoscope, Pill, Users, Video, Clock } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { user } = useAuth()

  // If user is logged in, show a welcome message instead of redirecting
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-900 mb-4">Welcome back, {user.name}!</h1>
          <p className="text-gray-600 mb-8">You're already logged in. Access your dashboard below.</p>
          <Link href={`/${user.role}`}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Go to {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-blue-900">MediLinka</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-blue-700 hover:text-blue-900">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Rest of the homepage content remains the same */}
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-blue-900 mb-6 leading-tight">
              The Future of
              <span className="text-blue-600"> Healthcare</span>
              <br />
              is Here
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Connect with healthcare professionals instantly through our advanced telemedicine platform. Get
              prescriptions, consultations, and pharmacy services all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
                  Start Your Journey
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-3 border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">Comprehensive Healthcare Solutions</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform combines telemedicine and telepharmacy services to provide complete healthcare access
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="glass border-blue-200 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Video className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-blue-900">Video Consultations</CardTitle>
                <CardDescription>Connect with certified doctors through secure HD video calls</CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass border-blue-200 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Pill className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-blue-900">Digital Prescriptions</CardTitle>
                <CardDescription>
                  Get prescriptions digitally and have medications delivered to your door
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass border-blue-200 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-blue-900">Secure & Private</CardTitle>
                <CardDescription>HIPAA-compliant platform ensuring your health data stays protected</CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass border-blue-200 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-blue-900">24/7 Availability</CardTitle>
                <CardDescription>
                  Access healthcare services anytime, anywhere with our round-the-clock platform
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass border-blue-200 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Stethoscope className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-blue-900">Expert Doctors</CardTitle>
                <CardDescription>
                  Consult with board-certified physicians across various specializations
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass border-blue-200 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-blue-900">Family Care</CardTitle>
                <CardDescription>Manage healthcare for your entire family from a single account</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-blue-600">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-blue-100">Patients Served</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1K+</div>
              <div className="text-blue-100">Certified Doctors</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Partner Pharmacies</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-blue-100">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-blue-900 mb-6">Ready to Transform Your Healthcare Experience?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of patients who trust MediLinka for their healthcare needs
            </p>
            <Link href="/auth/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
                Get Started Today
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">MediLinka</span>
              </div>
              <p className="text-blue-200">Revolutionizing healthcare through technology and compassionate care.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-blue-200">
                <li>Telemedicine</li>
                <li>Telepharmacy</li>
                <li>Health Records</li>
                <li>Appointments</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-blue-200">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-blue-200">
                <li>About Us</li>
                <li>Careers</li>
                <li>Press</li>
                <li>Partners</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-800 mt-8 pt-8 text-center text-blue-200">
            <p>&copy; 2024 MediLinka. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
