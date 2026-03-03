import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './layout/header/header';
import { Sidebar } from './layout/sidebar/sidebar';
import { MobileNav } from './layout/mobile-nav';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, Sidebar, MobileNav],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
