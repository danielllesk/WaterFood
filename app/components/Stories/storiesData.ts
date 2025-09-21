const storiesData = [
  {
    id: "0",
    link: "https://www.todocanada.ca/mothers-day-brunch-dinner-takeouts-in-kitchener-waterloo-region/",
    img: "https://www.todocanada.ca/wp-content/uploads/Mother%E2%80%99s-Day-BrunchDinner-Takeouts-in-Kitchener-Waterloo-Region.jpg",
    title: "Restaurants For Mother’s Day Brunch/Dinner in Kitchener-Waterloo Region",
    description:
      "Discover the best dining experiences in Waterloo with our curated list of top-rated restaurants. From cozy cafes to fine dining establishments, these spots offer incredible food and atmosphere that will make your visit memorable.",
  },
  {
    id: "1",
    link: "https://www.cbc.ca/news/canada/kitchener-waterloo/michelin-guide-kitchener-cambridge-odd-duck-langdon-hall-1.7638072",
    img: "https://i.cbc.ca/1.7638212.1758292978!/fileImage/httpImage/image.JPG_gen/derivatives/16x9_1180/odd-duck-kitchener.JPG?im=Resize%3D1280",
    title: "Kitchener's Odd Duck joins Cambridge's Langdon Hall as 'recommended' in Michelin Guide",
    description:
  "Michelin announced which restaurants in Toronto and region have received rates of two stars, one star, a green star (for using local and sustainable ingredients), a Bib Gourmand title which recognizes eateries for great food at a great value and then they also have restaurants that are recommended"
},
  {
    id: "2",
    link: "https://foodboxd.com/story/breaking-down-local-food-trends/",
    img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    title: "Breaking Down Local Food Trends in Waterloo",
    description:
      "Waterloo's food scene is constantly evolving. Join us as we explore the latest trends, from plant-based innovations to fusion cuisine, and discover what's hot in the local restaurant community.",
  },
  {
    id: "3",
    link: "https://www.ctvnews.ca/kitchener/article/patio-season-kicks-off-for-some-waterloo-region-restaurants/",
    img: "data:image/jpeg;base64,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",
    title: "Patio season kicks off for some Waterloo Region restaurants",
    description:
      "After weeks of wicked winter weather, the sun is finally out and March is off to a milder start in Waterloo Region. It’s prompting some local restaurants to get an early jump on patio season. The Charcoal Group of Restaurants has a handful of spots where local patios are now open. One of them is The Bauer Kitchen, where CTV News caught up with some people enjoying the patio on Tuesday.",
  },
  {
    id: "4",
    link: "https://www.cbc.ca/news/canada/kitchener-waterloo/puppy-patios-the-wooly-beertown-dog-beer-brumasters-barking-brew-1.7587327",
    img: "https://i.cbc.ca/1.7587487.1752768134!/fileImage/httpImage/image.jpg_gen/derivatives/16x9_1180/bru-master.jpg?im=Resize%3D1280",
    title: "Local restaurants say 'bone appetit' to puppy patios",
    description:
  "When it's the dog days of summer, we hit our favourite patios with friends and family. Since many consider their furry good boys and girls part of the family, more restaurants are putting in the effort to make canine companions feel as welcome as their humans."  
},
  {
    id: "5",
    link: "https://www.todocanada.ca/15-restaurants-for-a-romantic-date-night-dinner-in-kw-region/",
    img: "https://www.todocanada.ca/wp-content/uploads/15-Restaurants-For-a-Romantic-Date-Night-Dinner-in-KW-Region.jpg",
    title: "15 Restaurants For a Romantic Date Night Dinner in Kitchener-Waterloo Region",
    description:
      "From fine dining restaurants to street food vendors, there’s something for everyone. If you are looking for a place to swoon your special someone, here is our list of romantic restaurants for your next romantic dinner date or a casual night out.",
  },
  //gonna add more here when i get to details
];

export default storiesData;
