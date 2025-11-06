'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, FileText, Shield, Users, CreditCard, Printer, AlertTriangle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function GeneralConditionsPage() {
  return (
    <div className="flex-grow bg-grid">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/profile">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Profile
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">General Conditions of Use</h1>
          </div>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Introduction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Welcome to SharePrinto, a platform that connects creators with farmers (3D printing service providers) 
              to facilitate 3D printing services. These General Conditions of Use (GCU) govern your use of our platform 
              and services.
            </p>
            <p>
              By accessing or using SharePrinto, you agree to be bound by these terms. If you disagree with any part 
              of these terms, you may not access our service.
            </p>
          </CardContent>
        </Card>

        {/* Definitions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Definitions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <h4 className="font-semibold mb-2">Platform</h4>
                <p className="text-sm text-muted-foreground">
                  SharePrinto, accessible at shareprinto.com, including all related services and applications.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Creator</h4>
                <p className="text-sm text-muted-foreground">
                  A user who submits 3D printing requests and orders through the platform.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Farmer</h4>
                <p className="text-sm text-muted-foreground">
                  A 3D printing service provider who accepts and fulfills printing orders from creators.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Order</h4>
                <p className="text-sm text-muted-foreground">
                  A 3D printing request submitted by a creator and accepted by a farmer.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Accounts */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Accounts and Registration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold">Account Creation</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>You must provide accurate, current, and complete information during registration.</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                <li>You must be at least 18 years old to create an account.</li>
                <li>One account per person is allowed.</li>
              </ul>
            </div>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold">Account Responsibilities</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>You are responsible for all activities that occur under your account.</li>
                <li>You must notify us immediately of any unauthorized use of your account.</li>
                <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Creator Responsibilities */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Creator Responsibilities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold">File Uploads</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>You must own or have proper rights to all files you upload.</li>
                <li>Files must be in supported formats (STL, OBJ, etc.).</li>
                <li>You are responsible for the quality and printability of your files.</li>
                <li>Files must not contain illegal, harmful, or inappropriate content.</li>
              </ul>
            </div>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold">Order Requirements</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Provide clear specifications for your printing requirements.</li>
                <li>Specify material preferences and quality expectations.</li>
                <li>Provide accurate delivery information.</li>
                <li>Pay for orders in a timely manner.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Farmer Responsibilities */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Printer className="h-5 w-5" />
              Farmer Responsibilities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold">Service Quality</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Provide accurate information about your printing capabilities.</li>
                <li>Maintain your printers in good working condition.</li>
                <li>Use appropriate materials as specified in orders.</li>
                <li>Meet agreed-upon delivery timelines.</li>
              </ul>
            </div>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold">Communication</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Respond promptly to creator inquiries.</li>
                <li>Notify creators of any delays or issues.</li>
                <li>Provide progress updates on orders.</li>
                <li>Maintain professional communication standards.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Payment and Pricing */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment and Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold">Pricing</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Prices are set by farmers and displayed before order confirmation.</li>
                <li>Prices include material costs, printing time, and platform fees.</li>
                <li>Additional costs may apply for special materials or expedited delivery.</li>
                <li>Prices are subject to change without notice.</li>
              </ul>
            </div>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold">Payment Terms</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Payment is processed through secure payment gateways.</li>
                <li>Payment is held in escrow until order completion.</li>
                <li>Refunds are processed according to our refund policy.</li>
                <li>We accept major credit cards and digital payment methods.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Intellectual Property
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold">Creator Rights</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Creators retain ownership of their uploaded files and designs.</li>
                <li>Farmers may not reproduce, distribute, or sell creator designs without permission.</li>
                <li>Farmers may only use files for the specific order requested.</li>
              </ul>
            </div>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold">Platform Rights</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>SharePrinto retains rights to platform technology and branding.</li>
                <li>We may use anonymized data for platform improvement.</li>
                <li>Users grant us license to display their content on the platform.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Privacy and Data Protection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy and Data Protection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold">Data Collection</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>We collect personal information necessary for service provision.</li>
                <li>Payment information is processed securely by third-party providers.</li>
                <li>We do not store credit card information on our servers.</li>
                <li>User data is protected according to applicable privacy laws.</li>
              </ul>
            </div>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold">Data Usage</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Personal data is used for order processing and communication.</li>
                <li>We may use contact information for service-related communications.</li>
                <li>Users can request data deletion or modification.</li>
                <li>We do not sell personal information to third parties.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Dispute Resolution */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Dispute Resolution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold">Communication First</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Users should attempt to resolve disputes directly first.</li>
                <li>Use the platform's messaging system for communication.</li>
                <li>Document all communications and agreements.</li>
              </ul>
            </div>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold">Platform Mediation</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>SharePrinto may mediate disputes between users.</li>
                <li>Our decisions are final and binding.</li>
                <li>We may withhold payments during dispute resolution.</li>
                <li>Users may be suspended for repeated disputes.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Limitation of Liability */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Limitation of Liability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold">Platform Liability</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>SharePrinto acts as an intermediary platform only.</li>
                <li>We are not responsible for the quality of printed items.</li>
                <li>Our liability is limited to the amount of fees paid to us.</li>
                <li>We are not liable for indirect or consequential damages.</li>
              </ul>
            </div>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold">User Liability</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Creators are responsible for the accuracy of their files.</li>
                <li>Farmers are responsible for the quality of their services.</li>
                <li>Users are liable for damages caused by their actions.</li>
                <li>Users must comply with applicable laws and regulations.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Account Termination
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold">Termination by User</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Users may terminate their account at any time.</li>
                <li>Active orders must be completed before termination.</li>
                <li>Outstanding payments must be settled.</li>
                <li>Account data will be deleted within 30 days.</li>
              </ul>
            </div>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold">Termination by Platform</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>We may terminate accounts for terms violations.</li>
                <li>Repeated disputes may result in account suspension.</li>
                <li>Fraudulent activity will result in immediate termination.</li>
                <li>Users will be notified of termination reasons.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Changes to Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold">Modification Rights</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>We reserve the right to modify these terms at any time.</li>
                <li>Users will be notified of significant changes.</li>
                <li>Continued use constitutes acceptance of new terms.</li>
                <li>Users may terminate their account if they disagree with changes.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold">Support</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Email: support@shareprinto.com</li>
                <li>Phone: +1 (555) 123-4567</li>
                <li>Response time: Within 24-48 hours</li>
                <li>Emergency support available for active orders</li>
              </ul>
            </div>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold">Legal Inquiries</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Legal: legal@shareprinto.com</li>
                <li>Address: 123 Print Street, Tech City, TC 12345</li>
                <li>Business hours: Monday-Friday, 9 AM - 6 PM EST</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8 border-t">
          <p className="text-sm text-muted-foreground mb-4">
            By using SharePrinto, you acknowledge that you have read, understood, and agree to be bound by these General Conditions of Use.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4" />
            <span>Last updated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
