function main() {
    $('#form').submit(function (e) {
        e.preventDefault();

        const loader = $('#loader')[0];
        loader.style = 'display: block; width: 4rem; height: 4rem;';
        $('#results')[0].style = 'display: none';

        let url = `/api/v1/websites_data/search?domain=${$('#domain')[0].value}`;

        $.get({
            url: url,
            processData: false,
            contentType: false,
            success: (data) => {
                console.log(data);
                writeResults(data);
            }
        })
            .fail(() => {
                console.log('Falling back to live query.');
                $.get({
                    url: url + '&live=true',
                    processData: false,
                    contentType: false,
                    success: (data) => {
                        console.log(data);
                        writeResults(data);
                    }
                })
            });
    });
}

const getTitleCaseFromCamelCase = (t) => {
    const result = t.replace(/([A-Z])/g, " $1");
    return result.charAt(0).toUpperCase() + result.slice(1);
};

function writeResults(results) {
    const resultsContainer = $('#results')[0];

    const loader = $('#loader')[0];
    loader.style = 'display: none';

    if (!results.length) {
        const messageEl = document.createElement('p');
        messageEl.innerHTML = '<strong>No results found for given domain.</strong>';
        resultsContainer.appendChild(messageEl);
        resultsContainer.style = 'display: block; width: 40%; margin-top: 5vh; margin-left: 30.5%; color: red;';
        $('#resultsTable')[0].style = 'display: none';
        return;
    }

    const resultTableElement = document.querySelector('#resultsTable');
    resultTableElement.innerHTML = '';

    Object.keys(results[0]).forEach(k => {
        const row = document.createElement('tr');
        const d1 = document.createElement('td');
        const d2 = document.createElement('td');

        d1.innerHTML = `<strong>${getTitleCaseFromCamelCase(k)}</strong>`;

        if (['divIdMain', 'divClassMain', 'consoleContent', 'backgroundRequests', 'cookies'].includes(k)) {
            const ifr = document.createElement('iframe');
            let html = '';
            if (['backgroundRequests', 'cookies'].includes(k)) {
                const requestLists = results[0][k] && results[0][k].split(';').map(r => `<li>${r.replace('[status', ' -> [status')}</li>`);
                html = `<ul>${(requestLists || []).join('\n')}</ul>`;
            } else {
                html = results[0][k];
            }
            ifr.srcdoc = `<html><body>${html}</body></html>`;
            d2.appendChild(ifr);
        } else {
            d2.innerText = results[0][k];
        }

        row.appendChild(d1);
        row.appendChild(d2);
        resultTableElement.appendChild(row);
    });

    resultsContainer.style = 'display: block';
}

main();
