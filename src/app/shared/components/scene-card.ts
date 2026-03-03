import { Component, input } from '@angular/core';
import { Scene } from '../../core/models/scene.model';
import { StatusBadge } from './status-badge';
import { TensionBar } from './tension-bar';

@Component({
  selector: 'app-scene-card',
  standalone: true,
  imports: [StatusBadge, TensionBar],
  templateUrl: './scene-card.html',
  styleUrl: './scene-card.scss',
})
export class SceneCard {
  readonly scene = input.required<Scene>();
}
