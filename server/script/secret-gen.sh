#!/bin/bash
TEMPLATE=.env.example
CURRENT=.env
BACKUP=.env.bak
TMPFILE=.env.tmp

rm -f "$TMPFILE"

# Mix template with current values
while IFS='' read -r LINE || [[ -n "$LINE" ]]; do
    if [[ "$LINE" =~ ^[[:space:]]*# ]]; then
        echo "$LINE" >> "$TMPFILE"
    elif [[ $LINE = *"="* ]]; then
        KEY=${LINE%%=*}
        VALUE=${LINE#*=}
        if [[ $VALUE = *"GENERATE_SECRET_HERE"* ]]; then
            echo "$LINE" >> "$TMPFILE"
        else
            if [ -f "$CURRENT" ]; then
                OLD=$(grep -o "$KEY=[^,]*" "$CURRENT" | sed 's/\(.*\)=\(.*\)/\2/' | tr -s "[:blank:]")
            else
                OLD=
            fi
            if [ "$OLD" = "" ]; then
                echo "$KEY=$VALUE" >> "$TMPFILE"
            else
                echo "$KEY=$OLD" >> "$TMPFILE"
            fi
        fi
    else
        echo "$LINE" >> "$TMPFILE"
    fi
done < "$TEMPLATE"

# Substitute secrets
for i in $(seq 1 $(grep -c GENERATE_SECRET_HERE "$TMPFILE")); do \
    sed -i "0,/GENERATE_SECRET_HERE/s/GENERATE_SECRET_HERE/$(openssl rand -base64 48 | sed -e 's/[\/|=|+]//g')/" "$TMPFILE"; \
done;

if [ -f "$CURRENT" ]; then
    mv "$CURRENT" "$BACKUP"
fi
mv "$TMPFILE" "$CURRENT"
