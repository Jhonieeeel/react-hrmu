import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/components/ui/combobox';

type Option = {
    value: string | number;
    label: string;
};

type SelectComboboxProps = {
    items: Option[];
    value: string | number | null;
    onValueChange: (value: string) => void;
    placeholder?: string;
    emptyText?: string;
};

export default function SelectCombobox({
    items,
    value,
    onValueChange,
    placeholder = 'Select an option',
    emptyText = 'No options found.',
}: SelectComboboxProps) {
    return (
        <Combobox onValueChange={onValueChange} items={items}>
            <ComboboxInput
                value={
                    items.find((item) => item.value === value)?.label ?? null
                }
                placeholder={placeholder}
            />
            <ComboboxContent>
                <ComboboxEmpty>{emptyText}</ComboboxEmpty>
                <ComboboxList>
                    {(item) => (
                        <ComboboxItem key={item.value} value={item.value}>
                            {item.label}
                        </ComboboxItem>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
}
