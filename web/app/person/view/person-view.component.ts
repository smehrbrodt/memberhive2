import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from "@angular/router";
import { MdDialog, MdDialogRef, MdDialogConfig } from '@angular/material';

import { TitleService } from "../../common/title.service";
import { PersonService } from "../person.service";
import { Person } from "../person";

import { AvatarEditDialogComponent } from '../dialogs/avatar-edit.dialog';
import { PersonRelationsDialogComponent } from "../dialogs/person-relations.dialog";

@Component({
    moduleId: 'mh-person',
    selector: 'mh-person-view',
    templateUrl: './person-view.component.html',
    styleUrls: ['./person-view.component.scss']
})
export class PersonViewComponent implements OnInit {
    private persons: Array<Person>;
    person: Person;
    dialogRef: MdDialogRef<PersonRelationsDialogComponent>;
    lastCloseResult: string;

    constructor(private titleService: TitleService,
                private router: Router,
                private route: ActivatedRoute,
                private personService: PersonService,
                public dialog: MdDialog) {
    }

    ngOnInit(): void {
        this.route.params
            .switchMap((params: Params) => this.personService.getPerson(params['id']))
            .subscribe((person: Person) => {
                this.person = person;
                this.titleService.setTitle('Person: ' + person.fullName);
        });
    }

    prevPerson(): void {
        this.personService.getPersons() // TODO: get them from the cache
            .subscribe(
                (persons: Array<Person>) => {
                    this.persons = persons;
                    let idx: number = this.persons.findIndex((p: Person) => p.uid === this.person.uid);
                    idx--;
                    if (this.persons[idx]) {
                        this.router.navigate(['/person/view', this.persons[idx].uid]);
                    }
                });
    }
    nextPerson(): void {
        this.personService.getPersons() // TODO: get them from the cache
            .subscribe(
                (persons: Array<Person>) => {
                    this.persons = persons;
                    let idx: number = this.persons.findIndex((p: Person) => p.uid === this.person.uid);
                    idx++;
                    if (this.persons[idx]) {
                        this.router.navigate(['/person/view', this.persons[idx].uid]);
                    }
                });
    }
    openDlgRelationships(): void {
        this.dialogRef = this.dialog.open(PersonRelationsDialogComponent);

        this.dialogRef.afterClosed().subscribe((result: string) => {
            this.lastCloseResult = result;
            this.dialogRef = undefined;
        });
    }
    openDlgAvatar(): void {
        let config: MdDialogConfig = new MdDialogConfig();
        config.data = {
            context: 'person',
            id: this.person.uid,
            avatar: this.person.avatar
        };

        this.dialogRef = this.dialog.open(AvatarEditDialogComponent, config);
        this.dialogRef.afterClosed().subscribe((result: any) => {
            if (result === typeof Person) {
                this.person = result;
            }
            // update and refesh the person being edited
            this.dialogRef = undefined;
        });
    }
}
