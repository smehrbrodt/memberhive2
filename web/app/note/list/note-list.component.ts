import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from "@angular/router";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MdDialog } from '@angular/material';

import { NoteService } from "../note.service";
import { Note, NoteType } from "../note";

import { ShoutService } from "../../common/shout.service";
import { AuthService } from '../../common/auth/auth.service';

@Component({
    selector: 'mh-note-list',
    templateUrl: 'note-list.component.html',
    styleUrls: ['note-list.component.scss']
})
export class NoteListComponent implements OnInit {
    private notes: Array<Note>;
    private noteTypes: Array<NoteType>;
    private ownerId: string;

    showTypeSelector: boolean = false;
    noteForm: FormGroup;
    submitted: boolean = false;

    constructor(private fb: FormBuilder,
                private route: ActivatedRoute,
                private noteService: NoteService,
                private shout: ShoutService,
                private auth: AuthService,
                public dialog: MdDialog) {
        this.noteService.getNoteTypes() // TODO: move this into the options table
            .subscribe((types: Array<NoteType>) => {
                this.noteTypes = types;
            });
    }

    ngOnInit(): void {
        this.ownerId = this.auth.getCurrentUser().uid;
        this.noteForm = this.fb.group({
            text: [undefined, [<any>Validators.required]],
            type: [undefined, [<any>Validators.required]],
            private: [undefined]
        });
        this.route.params
            .switchMap((params: Params) => this.noteService.getNotes(params['id']))
            .subscribe((notes: Array<Note>) => {
                this.notes = notes;
            });

    }

    toggleTypes(): void {
        if (this.showTypeSelector && !this.noteForm.dirty) {
            this.noteForm.reset();
            this.showTypeSelector = false;
        } else {
            this.showTypeSelector = true;
        }
    }

    clearForm(): void {
        this.noteForm.reset();
        this.showTypeSelector = false;
    }

    save(model: Note, isValid: boolean): void {
        this.submitted = true;
        this.showTypeSelector = false;
        if (isValid) {
            model.ownerId = this.ownerId;
            model.recipients = [this.route.snapshot.params['id']];
            this.noteService.createNotePerson(model)
                .subscribe(
                    (data: Note) => {
                        this.noteForm.reset();
                        this.notes.unshift(data);
                        this.shout.success('Note is saved!');
                        return true;
                    },
                    (error: any) => {
                        this.shout.error('Error in save!' + error);
                        return false;
                    }
                );
        }
    }

    iOwn(uid: string): boolean {
        return uid === this.ownerId;
    }

    deleteNote(note: Note): void {
        this.noteService.deleteNote(note.id)
            .subscribe(
                (data: string) => {
                    this.shout.success(data);
                    return true;
                },
                (error: any) => {
                    this.shout.error('Error in note delete!');
                    return false;
                }
            );
    }
}
