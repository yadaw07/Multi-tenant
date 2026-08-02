'use client';

import { useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Sheet, SheetTrigger, SheetContent, SheetTitle } from '../ui/sheet';
import {
  Brain,
  Building,
  FileText,
  Home,
  LogIn,
  Menu,
  UserPlus,
  Users,
} from 'lucide-react';
import { Button } from '../ui/button';

import { Show, useOrganization, UserButton, useUser } from '@clerk/nextjs';

function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { user, isLoaded: userLoaded } = useUser();
  const { organization, isLoaded: orgLoaded } = useOrganization();

  const navItems = () => {
    const baseItems = [
      { href: '/', label: 'Home', icon: <Home className='w-4 h-4' /> },
      {
        href: '/select-org',
        label: 'Switch Organization',
        icon: <Users className='w-4 h-4' />,
      },
    ];

    if (organization) {
      return [
        ...baseItems,
        {
          href: `/${organization.slug}`,
          label: 'Organization Dashboard',
          icon: <Building className='w-4 h-4' />,
        },
        {
          href: `/${organization.slug}/documents`,
          label: 'Organization Documents',
          icon: <FileText className='w-4 h-4' />,
        },
      ];
    }

    return [...baseItems];
  };

  const renderNavLinks = (onClick?: () => void) =>
    navItems().map((item) => {
      const isActive =
        pathname === item.href ||
        (item.href !== '/' && pathname.startsWith(item.href));

      return (
        <Link key={item.href} href={item.href} onClick={onClick}>
          <Button
            variant={isActive ? 'secondary' : 'ghost'}
            size='sm'
            className='gap-2 w-full justify-start'
          >
            {item.icon}
            {item.label}
          </Button>
        </Link>
      );
    });

  return (
    <header className='sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/60 '>
      <div className='container mx-auto px-4 h-16 flex items-center justify-between'>
        {/* Logo */}
        <Link href='/' className='flex items-center gap-2 font-bold text-xl'>
          <Brain className='w-6 h-6 text-blue-600' />
          DocuAI
        </Link>

        {/* Desktop Navigation */}
        <nav className='hidden md:flex items-center gap-1'>
          {renderNavLinks()}
        </nav>

        {/* Auth */}
        <div className='flex items-center gap-4'>
          <Show when='signed-out'>
            <div className='hidden md:flex items-center gap-2'>
              <Link href='/sign-in'>
                <Button variant='ghost' size='sm'>
                  <LogIn className='h-4 w-4 mr-1' />
                  Sign In
                </Button>
              </Link>

              <Link href='/sign-up'>
                <Button size='sm'>
                  <UserPlus className='h-4 w-4 mr-1' />
                  Sign Up
                </Button>
              </Link>
            </div>
          </Show>

          <Show when='signed-in'>
            <div className='hidden md:flex items-center gap-2'>
              <span className='text-sm text-gray-600'>
                {organization
                  ? `In ${organization.name}`
                  : user?.firstName || user?.username}
              </span>
              <UserButton />
            </div>
          </Show>

          {/* Mobile hamburger — shows only below md */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button variant='ghost' size='sm' className='md:hidden' />
              }
            >
              <Menu className='w-5 h-5' />
            </SheetTrigger>

            <SheetContent side='right' className='w-64'>
              <SheetTitle className='sr-only'>Navigation Menu</SheetTitle>
              <div className='flex flex-col gap-2 mt-8'>
                {renderNavLinks(() => setMobileOpen(false))}

                <div className='border-t my-2' />

                <Show when='signed-out'>
                  <Link href='/sign-in' onClick={() => setMobileOpen(false)}>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='w-full justify-start gap-2'
                    >
                      <LogIn className='h-4 w-4' />
                      Sign In
                    </Button>
                  </Link>
                  <Link href='/sign-up' onClick={() => setMobileOpen(false)}>
                    <Button size='sm' className='w-full justify-start gap-2'>
                      <UserPlus className='h-4 w-4' />
                      Sign Up
                    </Button>
                  </Link>
                </Show>

                <Show when='signed-in'>
                  <div className='flex items-center gap-2 px-2 py-2'>
                    <UserButton />
                    <span className='text-sm text-gray-600'>
                      {organization
                        ? organization.name
                        : user?.firstName || user?.username}
                    </span>
                  </div>
                </Show>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export default Header;
