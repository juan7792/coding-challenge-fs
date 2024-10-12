import { Component, OnInit, HostListener } from '@angular/core';
import { PeopleCacheService } from '../services/people-cache.service';
import { PeopleDto } from 'shared/src/lib/peopleDto';

@Component({
  selector: 'people-client',
  templateUrl: './people-client.component.html',
  styleUrl: './people-client.component.css'
})
export class PeopleClientComponent implements OnInit {
  allPeople: PeopleDto[] = [];
  displayedPeople: PeopleDto[] = [];
  filterText: string = '';
  url = 'http://localhost:3000/server/people-server';
  currentPage = 1;
  pageSize = 10;
  isLoading = false;
  uniqueHomeworldsCount: number = 0;

  constructor(private cacheService: PeopleCacheService) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.isLoading = true;
    this.cacheService.get(this.url).subscribe(
      (data: PeopleDto[]) => {
        this.allPeople = data;
        this.updateDisplayedPeople();
        this.calculateUniqueHomeworlds();
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching people:', error);
        this.isLoading = false;
      }
    );
  }

  updateDisplayedPeople(): void {
    let filteredPeople = this.allPeople;
    if (this.filterText) {
      const filterLower = this.filterText.toLowerCase();
      filteredPeople = this.allPeople.filter(person => 
        person.name.toLowerCase().includes(filterLower) ||
        person.birthYear.toLowerCase().includes(filterLower) ||
        person.homeworldName.toLowerCase().includes(filterLower) ||
        person.homeworldTerrain.toLowerCase().includes(filterLower)
      );
    }
    
    const startIndex = 0;
    const endIndex = this.currentPage * this.pageSize;
    this.displayedPeople = filteredPeople.slice(startIndex, endIndex);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.updateDisplayedPeople();
  }

  loadMorePeople(): void {
    if (this.isLoading) return;
    this.isLoading = true;
    this.currentPage++;
    this.updateDisplayedPeople();
    this.isLoading = false;
  }

  calculateUniqueHomeworlds(): void {
    const uniqueHomeworlds = new Set(this.allPeople.map(person => person.homeworldName));
    this.uniqueHomeworldsCount = uniqueHomeworlds.size;
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 200 && !this.isLoading) {
      this.loadMorePeople();
    }
  }
}