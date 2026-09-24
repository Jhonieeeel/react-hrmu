import { useForm } from '@inertiajs/react';
import { Building2, FolderKanban, Plus, Save, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import divisions from '@/routes/divisions';
import sections from '@/routes/sections';
import units from '@/routes/units';

type Division = { id: number; division_name: string; division_code: string };
type Section = {
    id: number;
    division_id: number | null;
    section_name: string;
    section_code: string;
};
type Unit = {
    id: number;
    section_id: number;
    unit_name: string;
    unit_code: string;
};

type Props = {
    divisions: Division[];
    sections: Section[];
    units: Unit[];
};

export default function OrganizationManager({
    divisions: divisionList,
    sections: sectionList,
    units: unitList,
}: Props) {
    const [editing, setEditing] = useState<string | null>(null);
    const divisionForm = useForm({ division_name: '', division_code: '' });
    const sectionForm = useForm({
        division_id: '',
        section_name: '',
        section_code: '',
    });
    const unitForm = useForm({ section_id: '', unit_name: '', unit_code: '' });

    function resetForms() {
        setEditing(null);
        divisionForm.reset();
        sectionForm.reset();
        unitForm.reset();
    }

    function editDivision(division: Division) {
        setEditing(`division-${division.id}`);
        divisionForm.setData({
            division_name: division.division_name,
            division_code: division.division_code,
        });
    }

    function editSection(section: Section) {
        setEditing(`section-${section.id}`);
        sectionForm.setData({
            division_id: section.division_id ? String(section.division_id) : '',
            section_name: section.section_name,
            section_code: section.section_code,
        });
    }

    function editUnit(unit: Unit) {
        setEditing(`unit-${unit.id}`);
        unitForm.setData({
            section_id: String(unit.section_id),
            unit_name: unit.unit_name,
            unit_code: unit.unit_code,
        });
    }

    function deleteDivision(id: number) {
        divisionForm.delete(divisions.destroy(id).url, {
            preserveScroll: true,
        });
    }

    function deleteSection(id: number) {
        sectionForm.delete(sections.destroy(id).url, { preserveScroll: true });
    }

    function deleteUnit(id: number) {
        unitForm.delete(units.destroy(id).url, { preserveScroll: true });
    }

    return (
        <div className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-3">
                <Card className="gap-0 overflow-hidden py-0">
                    <CardHeader className="border-b bg-violet-500/5">
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="size-4 text-violet-600" />{' '}
                            Divisions
                        </CardTitle>
                        <CardDescription>
                            Manage division names and abbreviations.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 p-4">
                        <form
                            className="space-y-3"
                            onSubmit={(event) => {
                                event.preventDefault();
                                const id = editing?.startsWith('division-')
                                    ? editing.split('-')[1]
                                    : null;
                                divisionForm.submit(
                                    id
                                        ? divisions.update(Number(id))
                                        : divisions.store(),
                                    {
                                        method: id ? 'put' : 'post',
                                        onSuccess: resetForms,
                                    },
                                );
                            }}
                        >
                            <div className="grid gap-2 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="division_name">Name</Label>
                                    <Input
                                        id="division_name"
                                        value={divisionForm.data.division_name}
                                        onChange={(e) =>
                                            divisionForm.setData(
                                                'division_name',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="division_code">Code</Label>
                                    <Input
                                        id="division_code"
                                        value={divisionForm.data.division_code}
                                        onChange={(e) =>
                                            divisionForm.setData(
                                                'division_code',
                                                e.target.value.toUpperCase(),
                                            )
                                        }
                                    />
                                </div>
                            </div>
                            {Object.keys(divisionForm.errors).length > 0 && (
                                <p className="text-sm text-destructive">
                                    {Object.values(divisionForm.errors)[0]}
                                </p>
                            )}
                            <Button
                                type="submit"
                                disabled={divisionForm.processing}
                                className="w-full"
                            >
                                {editing?.startsWith('division-') ? (
                                    <Save />
                                ) : (
                                    <Plus />
                                )}
                                {divisionForm.processing
                                    ? 'Saving...'
                                    : editing?.startsWith('division-')
                                      ? 'Update division'
                                      : 'Add division'}
                            </Button>
                        </form>
                        <div className="divide-y rounded-lg border">
                            {divisionList.map((division) => (
                                <div
                                    key={division.id}
                                    className="flex items-center justify-between gap-2 p-3"
                                >
                                    <div>
                                        <p className="text-sm font-medium">
                                            {division.division_code}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {division.division_name}
                                        </p>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            onClick={() =>
                                                editDivision(division)
                                            }
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            className="text-destructive"
                                            onClick={() =>
                                                deleteDivision(division.id)
                                            }
                                            aria-label={`Delete ${division.division_code}`}
                                        >
                                            <Trash2 />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="gap-0 overflow-hidden py-0">
                    <CardHeader className="border-b bg-sky-500/5">
                        <CardTitle className="flex items-center gap-2">
                            <FolderKanban className="size-4 text-sky-600" />{' '}
                            Sections
                        </CardTitle>
                        <CardDescription>
                            Manage section abbreviations and assignments.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 p-4">
                        <form
                            className="space-y-3"
                            onSubmit={(event) => {
                                event.preventDefault();
                                const id = editing?.startsWith('section-')
                                    ? editing.split('-')[1]
                                    : null;
                                sectionForm.submit(
                                    id
                                        ? sections.update(Number(id))
                                        : sections.store(),
                                    {
                                        method: id ? 'put' : 'post',
                                        onSuccess: resetForms,
                                    },
                                );
                            }}
                        >
                            <div>
                                <Label htmlFor="section_name">Name</Label>
                                <Input
                                    id="section_name"
                                    value={sectionForm.data.section_name}
                                    onChange={(e) =>
                                        sectionForm.setData(
                                            'section_name',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="section_division">
                                        Division
                                    </Label>
                                    <select
                                        id="section_division"
                                        value={sectionForm.data.division_id}
                                        onChange={(e) =>
                                            sectionForm.setData(
                                                'division_id',
                                                e.target.value,
                                            )
                                        }
                                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                                    >
                                        <option value="">No division</option>
                                        {divisionList.map((division) => (
                                            <option
                                                key={division.id}
                                                value={division.id}
                                            >
                                                {division.division_code}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="section_code">Code</Label>
                                    <Input
                                        id="section_code"
                                        value={sectionForm.data.section_code}
                                        onChange={(e) =>
                                            sectionForm.setData(
                                                'section_code',
                                                e.target.value.toUpperCase(),
                                            )
                                        }
                                    />
                                </div>
                            </div>
                            <Button
                                type="submit"
                                disabled={sectionForm.processing}
                                className="w-full"
                            >
                                {editing?.startsWith('section-') ? (
                                    <Save />
                                ) : (
                                    <Plus />
                                )}
                                {sectionForm.processing
                                    ? 'Saving...'
                                    : editing?.startsWith('section-')
                                      ? 'Update section'
                                      : 'Add section'}
                            </Button>
                        </form>
                        <div className="divide-y rounded-lg border">
                            {sectionList.map((section) => (
                                <div
                                    key={section.id}
                                    className="flex items-center justify-between gap-2 p-3"
                                >
                                    <div>
                                        <p className="text-sm font-medium">
                                            {section.section_code}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {section.section_name}
                                        </p>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => editSection(section)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            className="text-destructive"
                                            onClick={() =>
                                                deleteSection(section.id)
                                            }
                                            aria-label={`Delete ${section.section_code}`}
                                        >
                                            <Trash2 />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="gap-0 overflow-hidden py-0">
                    <CardHeader className="border-b bg-emerald-500/5">
                        <CardTitle className="flex items-center gap-2">
                            <FolderKanban className="size-4 text-emerald-600" />{' '}
                            Units
                        </CardTitle>
                        <CardDescription>
                            Manage unit abbreviations under sections.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 p-4">
                        <form
                            className="space-y-3"
                            onSubmit={(event) => {
                                event.preventDefault();
                                const id = editing?.startsWith('unit-')
                                    ? editing.split('-')[1]
                                    : null;
                                unitForm.submit(
                                    id
                                        ? units.update(Number(id))
                                        : units.store(),
                                    {
                                        method: id ? 'put' : 'post',
                                        onSuccess: resetForms,
                                    },
                                );
                            }}
                        >
                            <div>
                                <Label htmlFor="unit_section">Section</Label>
                                <select
                                    id="unit_section"
                                    value={unitForm.data.section_id}
                                    onChange={(e) =>
                                        unitForm.setData(
                                            'section_id',
                                            e.target.value,
                                        )
                                    }
                                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                                >
                                    <option value="">Select a section</option>
                                    {sectionList.map((section) => (
                                        <option
                                            key={section.id}
                                            value={section.id}
                                        >
                                            {section.section_code} —{' '}
                                            {section.section_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="unit_name">Name</Label>
                                    <Input
                                        id="unit_name"
                                        value={unitForm.data.unit_name}
                                        onChange={(e) =>
                                            unitForm.setData(
                                                'unit_name',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="unit_code">Code</Label>
                                    <Input
                                        id="unit_code"
                                        value={unitForm.data.unit_code}
                                        onChange={(e) =>
                                            unitForm.setData(
                                                'unit_code',
                                                e.target.value.toUpperCase(),
                                            )
                                        }
                                    />
                                </div>
                            </div>
                            <Button
                                type="submit"
                                disabled={unitForm.processing}
                                className="w-full"
                            >
                                {editing?.startsWith('unit-') ? (
                                    <Save />
                                ) : (
                                    <Plus />
                                )}
                                {unitForm.processing
                                    ? 'Saving...'
                                    : editing?.startsWith('unit-')
                                      ? 'Update unit'
                                      : 'Add unit'}
                            </Button>
                        </form>
                        <div className="divide-y rounded-lg border">
                            {unitList.map((unit) => (
                                <div
                                    key={unit.id}
                                    className="flex items-center justify-between gap-2 p-3"
                                >
                                    <div>
                                        <p className="text-sm font-medium">
                                            {unit.unit_code}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {unit.unit_name}
                                        </p>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => editUnit(unit)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            className="text-destructive"
                                            onClick={() => deleteUnit(unit.id)}
                                            aria-label={`Delete ${unit.unit_code}`}
                                        >
                                            <Trash2 />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
            {editing && (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={resetForms}
                >
                    <X /> Cancel editing
                </Button>
            )}
        </div>
    );
}
