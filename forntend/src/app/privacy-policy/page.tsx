'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Shield, Users, Database, Eye, Lock, Mail, Phone, MapPin, Calendar, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
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
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
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
              At SharePrinto, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform 
              and services.
            </p>
            <p>
              By using SharePrinto, you consent to the data practices described in this policy. If you do not agree with our 
              policies and practices, please do not use our service.
            </p>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold">Personal Information</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li><strong>Account Information:</strong> Name, email address, phone number, and user type (creator/farmer)</li>
                <li><strong>Profile Information:</strong> Avatar, address, city, state, country, and ZIP code</li>
                <li><strong>Contact Information:</strong> Email addresses and phone numbers for communication</li>
                <li><strong>Location Data:</strong> Geographic location for service matching and delivery</li>
              </ul>
            </div>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold">Service-Related Information</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li><strong>3D Files:</strong> STL, OBJ, and other 3D model files you upload</li>
                <li><strong>Order Details:</strong> Printing specifications, materials, quantities, and delivery preferences</li>
                <li><strong>Printer Information:</strong> For farmers: printer models, capabilities, and availability status</li>
                <li><strong>Payment Information:</strong> Payment method details (processed securely by third-party providers)</li>
              </ul>
            </div>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold">Technical Information</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li><strong>Device Information:</strong> IP address, browser type, operating system, and device identifiers</li>
                <li><strong>Usage Data:</strong> Pages visited, features used, and interaction patterns</li>
                <li><strong>Log Data:</strong> Server logs, error reports, and performance metrics</li>
                <li><strong>Cookies:</strong> Small data files stored on your device (see our Cookie Policy)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Your Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold">Service Provision</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Process and fulfill your 3D printing orders</li>
                <li>Match creators with appropriate farmers</li>
                <li>Facilitate communication between users</li>
                <li>Process payments and handle financial transactions</li>
                <li>Provide customer support and technical assistance</li>
              </ul>
            </div>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold">Platform Improvement</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Analyze usage patterns to improve our services</li>
                <li>Develop new features and functionality</li>
                <li>Optimize platform performance and user experience</li>
                <li>Conduct research and analytics (using anonymized data)</li>
              </ul>
            </div>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold">Communication</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Send order updates and status notifications</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Send important service announcements and updates</li>
                <li>Share relevant promotional content (with your consent)</li>
              </ul>
            </div>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold">Legal and Security</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Comply with legal obligations and regulations</li>
                <li>Prevent fraud, abuse, and security threats</li>
                <li>Enforce our terms of service and policies</li>
                <li>Protect the rights and safety of our users</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Information Sharing */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Information Sharing and Disclosure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold">Service Providers</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li><strong>Payment Processors:</strong> Secure payment processing (we don't store credit card data)</li>
                <li><strong>Cloud Services:</strong> Data storage and hosting services</li>
                <li><strong>Analytics Providers:</strong> Usage analytics and performance monitoring</li>
                <li><strong>Communication Services:</strong> Email and notification delivery</li>
              </ul>
            </div>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold">User-to-User Sharing</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Order details are shared between matched creators and farmers</li>
                <li>Contact information may be shared for order fulfillment</li>
                <li>3D files are shared only with the assigned farmer for printing</li>
                <li>User profiles are visible to other users for service matching</li>
              </ul>
            </div>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold">Legal Requirements</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Comply with court orders and legal requests</li>
                <li>Respond to government investigations</li>
                <li>Protect against fraud and security threats</li>
                <li>Enforce our terms of service and policies</li>
              </ul>
            </div>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold">Business Transfers</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>In case of merger, acquisition, or sale of assets</li>
                <li>User information may be transferred to the new entity</li>
                <li>Users will be notified of any material changes</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Data Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold">Security Measures</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication and access controls</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Employee training on data protection practices</li>
                <li>Incident response and breach notification procedures</li>
              </ul>
            </div>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold">Data Retention</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Account data: Retained while account is active</li>
                <li>Order data: Retained for 7 years for legal compliance</li>
                <li>3D files: Deleted 30 days after order completion</li>
                <li>Log data: Retained for 1 year for security purposes</li>
                <li>Payment data: Processed by third-party providers</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your Privacy Rights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold">Access and Control</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                <li><strong>Restriction:</strong> Limit how we process your data</li>
              </ul>
            </div>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold">Communication Preferences</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Opt-out of marketing communications</li>
                <li>Control notification settings</li>
                <li>Manage email preferences</li>
                <li>Unsubscribe from promotional emails</li>
              </ul>
            </div>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold">Account Management</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Update profile information through your account settings</li>
                <li>Deactivate or delete your account</li>
                <li>Manage connected devices and sessions</li>
                <li>Review and control third-party integrations</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* International Data Transfers */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              International Data Transfers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              SharePrinto operates globally and may transfer your data to countries other than your own. 
              We ensure that such transfers comply with applicable data protection laws and implement 
              appropriate safeguards to protect your information.
            </p>
            <div className="space-y-3">
              <h4 className="font-semibold">Safeguards</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Standard contractual clauses for EU data transfers</li>
                <li>Adequacy decisions for approved countries</li>
                <li>Certification schemes and codes of conduct</li>
                <li>Regular assessment of transfer mechanisms</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Children's Privacy */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Children's Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              SharePrinto is not intended for children under 18 years of age. We do not knowingly collect 
              personal information from children under 18. If you are a parent or guardian and believe 
              your child has provided us with personal information, please contact us immediately.
            </p>
            <p>
              If we become aware that we have collected personal information from a child under 18, 
              we will take steps to delete such information promptly.
            </p>
          </CardContent>
        </Card>

        {/* Third-Party Services */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Third-Party Services
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Our platform may contain links to third-party websites and services. We are not responsible 
              for the privacy practices of these third parties. We encourage you to review their privacy 
              policies before providing any personal information.
            </p>
            <div className="space-y-3">
              <h4 className="font-semibold">Third-Party Services We Use</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li><strong>Payment Processors:</strong> Stripe, PayPal for secure payment processing</li>
                <li><strong>Cloud Storage:</strong> AWS, Google Cloud for data storage</li>
                <li><strong>Analytics:</strong> Google Analytics for usage insights</li>
                <li><strong>Communication:</strong> SendGrid, Twilio for notifications</li>
                <li><strong>Security:</strong> Cloudflare for DDoS protection</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Changes to Privacy Policy */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Changes to This Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices, 
              technology, legal requirements, or other factors. We will notify you of any material 
              changes by:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Posting the updated policy on our website</li>
              <li>Sending email notifications to registered users</li>
              <li>Displaying in-app notifications</li>
              <li>Updating the "Last updated" date at the top of this policy</li>
            </ul>
            <p>
              Your continued use of SharePrinto after any changes indicates your acceptance of the 
              updated Privacy Policy.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-semibold">General Inquiries</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Email: privacy@shareprinto.com</li>
                  <li>Phone: +1 (555) 123-4567</li>
                  <li>Response time: Within 48 hours</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">Data Protection Officer</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Email: dpo@shareprinto.com</li>
                  <li>Address: 123 Print Street, Tech City, TC 12345</li>
                  <li>Business hours: Monday-Friday, 9 AM - 6 PM EST</li>
                </ul>
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold">Regulatory Authorities</h4>
              <p className="text-sm text-muted-foreground">
                If you are not satisfied with our response, you have the right to lodge a complaint 
                with your local data protection authority.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8 border-t">
          <p className="text-sm text-muted-foreground mb-4">
            This Privacy Policy is effective as of the date listed above and applies to all users of SharePrinto.
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
