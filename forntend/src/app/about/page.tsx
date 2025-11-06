'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  Printer, 
  FileText, 
  Shield, 
  Zap, 
  Globe, 
  CheckCircle, 
  ArrowRight,
  MessageSquare,
  Clock,
  DollarSign,
  Star
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="flex-grow bg-grid p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-6xl space-y-12">
        
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold font-headline bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
              SharePrinto
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              The revolutionary platform that turns your business ideas into reality through 3D printing. 
              Connect with skilled farmers worldwide to bring your designs to life.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <Users className="w-4 h-4 mr-2" />
              Community-Driven
            </Badge>
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <Globe className="w-4 h-4 mr-2" />
              Global Network
            </Badge>
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <Shield className="w-4 h-4 mr-2" />
              Secure & Reliable
            </Badge>
          </div>
        </div>

        {/* What is SharePrinto */}
        <Card className="border-2 border-green-100 bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-green-900">
              What is SharePrinto?
            </CardTitle>
            <CardDescription className="text-lg text-green-700">
              A global 3D printing marketplace that transforms business ideas into reality by connecting creators with skilled printing farmers worldwide
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  
                  <h3 className="text-xl font-semibold text-black-800">For Entrepreneurs & Creators</h3>
                </div>
                <p className="text-green-700 leading-relaxed">
                  Have a business idea? SharePrinto makes it simple. Upload your 3D designs and connect with skilled farmers worldwide 
                  who can turn your concepts into physical products. Perfect for prototyping your projects and testing ideas before full-scale production. 
                  No need for expensive equipment or manufacturing knowledge.
                </p>
                <ul className="space-y-2 text-green-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Upload and manage your 3D models
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Print prototypes of your projects quickly
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Connect with local printing experts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Track your orders in real-time
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                 
                  <h3 className="text-xl font-semibold text-black">For Skilled Farmers</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Turn your 3D printing expertise into a global business. Accept orders from entrepreneurs worldwide, 
                  use your skills to produce high-quality products, and build a reputation as a trusted manufacturing partner.
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Browse available printing jobs
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Set your own prices and terms
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Build your reputation and client base
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prototyping Section */}
        <Card className="border-2 border-green-100 bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-green-900">
              Perfect for Prototyping
            </CardTitle>
            <CardDescription className="text-lg text-green-700">
              Turn your ideas into physical prototypes quickly and cost-effectively
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-green-800">Rapid Prototyping</h3>
                <p className="text-green-700 leading-relaxed">
                  Need to test your product idea? SharePrinto connects you with skilled farmers who can quickly print 
                  prototypes of your projects. Perfect for entrepreneurs, inventors, and designers who want to validate 
                  their concepts before investing in full-scale production.
                </p>
                <ul className="space-y-2 text-green-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Fast turnaround times for prototypes
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Cost-effective testing of ideas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Multiple iterations and refinements
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-green-800">Ideal for Various Projects</h3>
                <p className="text-green-700 leading-relaxed">
                  Whether you're developing a new product, testing mechanical designs, creating architectural models, 
                  or validating engineering concepts, our platform provides the perfect solution for bringing your 
                  prototypes to life quickly and efficiently.
                </p>
                <ul className="space-y-2 text-green-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Product development and testing
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Mechanical and engineering prototypes
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Architectural and design models
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">How SharePrinto Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform makes turning business ideas into reality simple and efficient through a streamlined process
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-700"></div>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">1</span>
                </div>
                <CardTitle className="flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5" />
                  Upload & Create
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Entrepreneurs and creators upload their 3D models (.stl files) with specifications like material type, 
                  quantity, and delivery preferences. No technical expertise required.
                </p>
                <div className="flex justify-center">
                  <Badge variant="outline">STL Files</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-600 to-green-800"></div>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-700">2</span>
                </div>
                <CardTitle className="flex items-center justify-center gap-2">
                  <Printer className="w-5 h-5" />
                  Farmers Accept
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Skilled farmers worldwide browse available orders and accept those that match their capabilities 
                  and equipment. Global reach, local expertise.
                </p>
                <div className="flex justify-center gap-2">
                  <Badge variant="outline">Global Network</Badge>
                  <Badge variant="outline">Expertise Match</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-700 to-green-900"></div>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-green-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-800">3</span>
                </div>
                <CardTitle className="flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5" />
                  Print & Deliver
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Farmers print the models with real-time progress updates, then deliver the finished 
                  products to entrepreneurs. Your business idea becomes reality.
                </p>
                <div className="flex justify-center gap-2">
                  <Badge variant="outline">Real-time Updates</Badge>
                  <Badge variant="outline">Quality Assurance</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Big Schema Animation Section */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">How SharePrinto Works - Complete Flow</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              A visual representation of the complete SharePrinto ecosystem and workflow
            </p>
          </div>

          <Card className="border-2 border-green-100 bg-gradient-to-br from-green-50 to-white p-8">
            <div className="relative">
              {/* Main Flow Container */}
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-12">
                
                {/* Creator Side */}
                <div className="flex flex-col items-center space-y-6 w-full lg:w-1/3">
                  <div className="relative">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center border-4 border-green-300 animate-pulse">
                      <Image 
                        src="/iconsImages/creator.png" 
                        alt="Creator" 
                        width={48} 
                        height={48} 
                        className="rounded-full"
                      />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">1</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-green-800 mb-2">Creator</h3>
                    <p className="text-green-700 text-sm">Uploads 3D designs and project requirements</p>
                  </div>
                </div>

                {/* Arrow to Platform */}
                <div className="hidden lg:flex items-center justify-center w-1/6">
                  <div className="relative">
                    <div className="w-16 h-1 bg-green-400 rounded-full"></div>
                    <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                      <div className="w-0 h-0 border-l-8 border-l-green-400 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                    </div>
                  </div>
                </div>

                {/* Platform Center */}
                <div className="flex flex-col items-center space-y-6 w-full lg:w-1/3">
                  <div className="relative">
                    <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center border-4 border-green-300 shadow-lg animate-bounce">
                      <div className="text-center text-white">
                        <div className="text-2xl font-bold">SP</div>
                        <div className="text-xs">SharePrinto</div>
                      </div>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">2</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-green-800 mb-2">Platform</h3>
                    <p className="text-green-700 text-sm">Matches creators with skilled farmers</p>
                  </div>
                </div>

                {/* Arrow to Farmer */}
                <div className="hidden lg:flex items-center justify-center w-1/6">
                  <div className="relative">
                    <div className="w-16 h-1 bg-green-400 rounded-full"></div>
                    <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                      <div className="w-0 h-0 border-l-8 border-l-green-400 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                    </div>
                  </div>
                </div>

                {/* Farmer Side */}
                <div className="flex flex-col items-center space-y-6 w-full lg:w-1/3">
                  <div className="relative">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center border-4 border-blue-300 animate-pulse">
                      <Image 
                        src="/iconsImages/farmer.png" 
                        alt="Farmer" 
                        width={48} 
                        height={48} 
                        className="rounded-full"
                      />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">3</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-blue-800 mb-2">Farmer</h3>
                    <p className="text-blue-700 text-sm">Accepts orders and prints prototypes</p>
                  </div>
                </div>
              </div>

              {/* Detailed Process Flow */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
                
                {/* Step 1: Upload */}
                <Card className="border-green-200 bg-green-50">
                  <CardHeader className="text-center pb-2">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg text-green-800">Upload Design</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-green-700 text-sm">
                      Creator uploads 3D model (.stl file) with specifications
                    </p>
                  </CardContent>
                </Card>

                {/* Step 2: Match */}
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader className="text-center pb-2">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg text-blue-800">Smart Matching</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-blue-700 text-sm">
                      Platform finds skilled farmers based on requirements
                    </p>
                  </CardContent>
                </Card>

                {/* Step 3: Print */}
                <Card className="border-purple-200 bg-purple-50">
                  <CardHeader className="text-center pb-2">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Printer className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg text-purple-800">Print & Monitor</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-purple-700 text-sm">
                      Farmer prints with real-time progress updates
                    </p>
                  </CardContent>
                </Card>

                {/* Step 4: Deliver */}
                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader className="text-center pb-2">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg text-orange-800">Deliver & Review</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-orange-700 text-sm">
                      Prototype delivered, creator reviews and rates
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Communication Flow */}
              <div className="mt-12 p-6 bg-gray-50 rounded-lg">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Real-time Communication</h3>
                  <p className="text-gray-600">Continuous collaboration throughout the process</p>
                </div>
                
                <div className="flex items-center justify-center space-x-8">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-8 h-8 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-green-700">Creator</span>
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center space-x-4">
                    <div className="w-8 h-1 bg-green-300 rounded-full animate-pulse"></div>
                    <div className="w-8 h-1 bg-green-300 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-8 h-1 bg-green-300 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-8 h-8 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-blue-700">Farmer</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Key Features */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Key Features</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to turn your business ideas into successful products
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  Real-time Communication
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Built-in chat system for direct communication between entrepreneurs and farmers, 
                  ensuring smooth collaboration and idea refinement.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  Progress Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Real-time updates on print progress, status changes, and estimated completion times.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Transparent Pricing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Clear pricing structure with no hidden fees. Farmers set their rates, 
                  creators know exactly what they're paying for.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-green-600" />
                  Reputation System
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Build trust through reviews and ratings. Quality farmers get more orders, 
                  reliable creators get priority service.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Secure Platform
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your files and data are protected. Secure payment processing and 
                  dispute resolution system.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-green-600" />
                  Local Network
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Connect with farmers worldwide for diverse expertise, 
                  competitive pricing, and global market access.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-900 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Benefits for Entrepreneurs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-900">No Manufacturing Investment</h4>
                    <p className="text-green-700 text-sm">Turn your business ideas into products without expensive manufacturing setup</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-900">Expert Manufacturing</h4>
                    <p className="text-green-700 text-sm">Work with skilled farmers worldwide who specialize in different materials and techniques</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-900">Global Reach</h4>
                    <p className="text-green-700 text-sm">Access global markets and diverse manufacturing expertise worldwide</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-gray-50">
            <CardHeader>
              <CardTitle className="text-black flex items-center gap-2">
                <Printer className="w-5 h-5" />
                Benefits for Skilled Farmers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-black">Global Business Opportunity</h4>
                    <p className="text-gray-700 text-sm">Turn your 3D printing expertise into a global manufacturing business</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-black">Flexible Work</h4>
                    <p className="text-gray-700 text-sm">Choose your own hours and accept orders that fit your schedule</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-black">Build Global Reputation</h4>
                    <p className="text-gray-700 text-sm">Grow your international client base and become a trusted manufacturing partner</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-green-600 to-green-800 text-white">
          <CardContent className="p-8 text-center space-y-6">
            <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              Join our global community of entrepreneurs and skilled farmers today. Start turning your business ideas into reality 
              or build your global manufacturing business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                              <Button asChild size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-gray-100">
                  <Link href="/creator-signup">
                    Become a creator
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                              <Button asChild size="lg" variant="outline" className="bg-white text-green-600 hover:bg-gray-100">
                  <Link href="/farmer-signup">
                    Become a farmer
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">
              Common questions about SharePrinto
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How much does it cost to use SharePrinto?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  SharePrinto is free to join. Farmers set their own prices for printing services, 
                  and creators pay only for the printing work, not platform fees.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What file formats are supported?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We support .stl files, which is the standard format for 3D printing. 
                  Make sure your files are properly prepared and optimized for printing.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How do I find farmers in my area?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our platform automatically matches you with skilled farmers worldwide based on your requirements. 
                  You can browse available manufacturers and their ratings globally.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What if there's an issue with my print?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We have a built-in communication system and dispute resolution process. 
                  Most issues can be resolved through direct communication with your farmer.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
  