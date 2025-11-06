'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Cookie, Settings, Shield, Eye, Clock, CheckCircle, AlertTriangle, Users } from 'lucide-react';
import Link from 'next/link';

export default function CookiePolicyPage() {
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
            <Cookie className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Cookie Policy</h1>
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
              <Cookie className="h-5 w-5" />
              Introduction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              This Cookie Policy explains how SharePrinto uses cookies and similar technologies to recognize 
              you when you visit our website and use our platform. It explains what these technologies are 
              and why we use them, as well as your rights to control our use of them.
            </p>
            <p>
              By using SharePrinto, you consent to the use of cookies in accordance with this policy. 
              You can control and manage cookies through your browser settings.
            </p>
          </CardContent>
        </Card>

        {/* What Are Cookies */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5" />
              What Are Cookies?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Cookies are small text files that are placed on your device (computer, tablet, or mobile phone) 
              when you visit a website. They are widely used to make websites work more efficiently and to 
              provide information to website owners.
            </p>
            <div className="space-y-3">
              <h4 className="font-semibold">How Cookies Work</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Cookies are created when you visit a website</li>
                <li>They store information about your visit and preferences</li>
                <li>Your browser sends cookies back to the website on future visits</li>
                <li>This helps the website remember you and your preferences</li>
              </ul>
            </div>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold">Types of Cookies</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li><strong>Session Cookies:</strong> Temporary cookies that expire when you close your browser</li>
                <li><strong>Persistent Cookies:</strong> Cookies that remain on your device for a set period</li>
                <li><strong>First-Party Cookies:</strong> Cookies set by our website</li>
                <li><strong>Third-Party Cookies:</strong> Cookies set by external services we use</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Why We Use Cookies */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Why We Use Cookies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold">Essential Functions</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Keep you signed in to your account</li>
                <li>Remember your preferences and settings</li>
                <li>Maintain your shopping cart and order information</li>
                <li>Ensure secure authentication and session management</li>
                <li>Prevent fraud and security threats</li>
              </ul>
            </div>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold">Performance and Analytics</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Analyze how users interact with our platform</li>
                <li>Identify and fix technical issues</li>
                <li>Optimize website performance and loading times</li>
                <li>Understand user behavior and preferences</li>
                <li>Improve our services based on usage patterns</li>
              </ul>
            </div>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold">Personalization</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Remember your language and regional preferences</li>
                <li>Show relevant content and recommendations</li>
                <li>Customize your user experience</li>
                <li>Display personalized notifications and alerts</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Types of Cookies We Use */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Types of Cookies We Use
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold">Essential Cookies (Required)</h4>
              <p className="text-sm text-muted-foreground mb-2">
                These cookies are necessary for the website to function properly and cannot be disabled.
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li><strong>Authentication:</strong> Keep you logged in and secure</li>
                <li><strong>Session Management:</strong> Maintain your active session</li>
                <li><strong>Security:</strong> Protect against fraud and attacks</li>
                <li><strong>Order Processing:</strong> Maintain your cart and order data</li>
                <li><strong>Preferences:</strong> Remember your basic settings</li>
              </ul>
            </div>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold">Performance Cookies (Optional)</h4>
              <p className="text-sm text-muted-foreground mb-2">
                These cookies help us understand how visitors interact with our website.
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li><strong>Google Analytics:</strong> Website usage and performance metrics</li>
                <li><strong>Error Tracking:</strong> Identify and fix technical issues</li>
                <li><strong>Performance Monitoring:</strong> Track page load times and responsiveness</li>
                <li><strong>User Behavior:</strong> Understand how users navigate our platform</li>
              </ul>
            </div>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold">Functional Cookies (Optional)</h4>
              <p className="text-sm text-muted-foreground mb-2">
                These cookies enable enhanced functionality and personalization.
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li><strong>Language Preferences:</strong> Remember your preferred language</li>
                <li><strong>Theme Settings:</strong> Remember your UI theme preferences</li>
                <li><strong>Notification Settings:</strong> Remember your notification preferences</li>
                <li><strong>Search History:</strong> Remember your recent searches</li>
              </ul>
            </div>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold">Marketing Cookies (Optional)</h4>
              <p className="text-sm text-muted-foreground mb-2">
                These cookies are used to deliver relevant advertisements and track marketing campaign performance.
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li><strong>Advertising:</strong> Display relevant ads and promotions</li>
                <li><strong>Campaign Tracking:</strong> Measure marketing campaign effectiveness</li>
                <li><strong>Social Media:</strong> Enable social media sharing and integration</li>
                <li><strong>Retargeting:</strong> Show relevant content based on your interests</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Third-Party Cookies */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Third-Party Cookies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We use third-party services that may set their own cookies on your device. These services 
              help us provide better functionality and user experience.
            </p>
            <div className="space-y-3">
              <h4 className="font-semibold">Analytics Services</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li><strong>Google Analytics:</strong> Website usage analytics and performance monitoring</li>
                <li><strong>Hotjar:</strong> User behavior analysis and heatmaps</li>
                <li><strong>Mixpanel:</strong> Event tracking and user journey analysis</li>
              </ul>
            </div>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold">Payment Services</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li><strong>Stripe:</strong> Secure payment processing</li>
                <li><strong>PayPal:</strong> Alternative payment method</li>
                <li><strong>Square:</strong> Payment processing and fraud prevention</li>
              </ul>
            </div>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold">Communication Services</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li><strong>SendGrid:</strong> Email delivery and tracking</li>
                <li><strong>Twilio:</strong> SMS notifications and communication</li>
                <li><strong>Intercom:</strong> Customer support and chat functionality</li>
              </ul>
            </div>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold">Social Media</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li><strong>Facebook Pixel:</strong> Social media advertising and tracking</li>
                <li><strong>Twitter Pixel:</strong> Twitter advertising and analytics</li>
                <li><strong>LinkedIn Insight:</strong> Professional network advertising</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Cookie Duration */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Cookie Duration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold">Session Cookies</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li><strong>Duration:</strong> Until you close your browser</li>
                <li><strong>Purpose:</strong> Maintain your session and security</li>
                <li><strong>Examples:</strong> Authentication tokens, shopping cart data</li>
              </ul>
            </div>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold">Persistent Cookies</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li><strong>Short-term (1-30 days):</strong> User preferences, recent activity</li>
                <li><strong>Medium-term (30 days - 1 year):</strong> Analytics, performance data</li>
                <li><strong>Long-term (1+ years):</strong> Marketing, advertising preferences</li>
              </ul>
            </div>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold">Specific Durations</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li><strong>Authentication:</strong> 30 days (or until logout)</li>
                <li><strong>Language Preferences:</strong> 1 year</li>
                <li><strong>Analytics:</strong> 2 years</li>
                <li><strong>Marketing:</strong> 1-2 years</li>
                <li><strong>Security:</strong> Session only</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Managing Cookies */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Managing Your Cookie Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold">Browser Settings</h4>
              <p className="text-sm text-muted-foreground mb-2">
                You can control cookies through your browser settings. However, disabling certain cookies 
                may affect the functionality of our website.
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
                <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                <li><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
              </ul>
            </div>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold">Cookie Consent</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>We show a cookie consent banner when you first visit our website</li>
                <li>You can accept all cookies, reject non-essential cookies, or customize preferences</li>
                <li>You can change your preferences at any time through our cookie settings</li>
                <li>Essential cookies cannot be disabled as they are required for basic functionality</li>
              </ul>
            </div>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold">Opt-Out Options</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li><strong>Google Analytics:</strong> Use the Google Analytics opt-out browser add-on</li>
                <li><strong>Advertising:</strong> Opt out through the Digital Advertising Alliance</li>
                <li><strong>Social Media:</strong> Manage preferences through respective platform settings</li>
                <li><strong>Email Marketing:</strong> Unsubscribe links in all marketing emails</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Apps */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Mobile Applications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Our mobile applications may use similar technologies to cookies, such as device identifiers 
              and local storage, to provide functionality and improve user experience.
            </p>
            <div className="space-y-3">
              <h4 className="font-semibold">Mobile Technologies</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li><strong>Device Identifiers:</strong> Unique device IDs for analytics and security</li>
                <li><strong>Local Storage:</strong> App preferences and offline data</li>
                <li><strong>Push Notifications:</strong> Device tokens for notifications</li>
                <li><strong>Location Services:</strong> GPS data for service matching</li>
              </ul>
            </div>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold">Managing Mobile Settings</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Control permissions through your device settings</li>
                <li>Manage notification preferences in the app</li>
                <li>Clear app data and cache through device settings</li>
                <li>Uninstall the app to remove all associated data</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Updates to Cookie Policy */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Updates to This Cookie Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We may update this Cookie Policy from time to time to reflect changes in our practices, 
              technology, or legal requirements. We will notify you of any material changes by:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Posting the updated policy on our website</li>
              <li>Showing a notification banner on our platform</li>
              <li>Sending email notifications to registered users</li>
              <li>Updating the "Last updated" date at the top of this policy</li>
            </ul>
            <p>
              Your continued use of SharePrinto after any changes indicates your acceptance of the 
              updated Cookie Policy.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              If you have any questions about this Cookie Policy or our use of cookies, please contact us:
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
                <h4 className="font-semibold">Technical Support</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Email: support@shareprinto.com</li>
                  <li>Live chat: Available on our website</li>
                  <li>Help center: help.shareprinto.com</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8 border-t">
          <p className="text-sm text-muted-foreground mb-4">
            This Cookie Policy is effective as of the date listed above and applies to all users of SharePrinto.
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
