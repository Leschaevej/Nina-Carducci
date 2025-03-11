(function($) {
  $.fn.mauGallery = function(options) {
    var options = $.extend($.fn.mauGallery.defaults, options);
    var tagsCollection = [];
    return this.each(function() {
      $.fn.mauGallery.methods.createRowWrapper($(this));
      if (options.lightBox) {
        $.fn.mauGallery.methods.createLightBox(
          $(this),
          options.lightboxId,
          options.navigation
        );
      }

      $.fn.mauGallery.listeners(options);
      $(this)
        .children(".gallery-item")
        .each(function(index) {
          $.fn.mauGallery.methods.responsiveImageItem($(this));
          $.fn.mauGallery.methods.moveItemInRowWrapper($(this));
          $.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns);
          var theTag = $(this).data("gallery-tag");
          if (
            options.showTags &&
            theTag !== undefined &&
            tagsCollection.indexOf(theTag) === -1
          ) {
            tagsCollection.push(theTag);
          }
        });

      if (options.showTags) {
        $.fn.mauGallery.methods.showItemTags(
          $(this),
          options.tagsPosition,
          tagsCollection
        );
      }

      $(this).fadeIn(500);
    });
  };

  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true
  };

  $.fn.mauGallery.listeners = function(options) {
    $(".gallery-item").on("click", function() {
      if (options.lightBox && $(this).prop("tagName") === "IMG") {
        $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
      } else {
        return;
      }
    });

    $(".gallery").on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);
    $(".gallery").on("click", ".mg-prev", () =>
      $.fn.mauGallery.methods.prevImage(options.lightboxId)
    );

    $(".gallery").on("click", ".mg-next", () =>
      $.fn.mauGallery.methods.nextImage(options.lightboxId)
    );
  };
  $.fn.mauGallery.methods = {
    createRowWrapper(element) {
      if (
        !element
          .children()
          .first()
          .hasClass("row")
      ) {
        element.append('<div class="gallery-items-row row"></div>');
      }
    },

    wrapItemInColumn(element, columns) {
      if (columns.constructor === Number) {
        element.wrap(
          `<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`
        );
      } else if (columns.constructor === Object) {
        var columnClasses = "";
        if (columns.xs) {
          columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
        }
        if (columns.sm) {
          columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
        }
        if (columns.md) {
          columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
        }
        if (columns.lg) {
          columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
        }
        if (columns.xl) {
          columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
        }
        element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
      } else {
        console.error(
          `Columns should be defined as numbers or objects. ${typeof columns} is not supported.`
        );
      }
    },

    moveItemInRowWrapper(element) {
      element.appendTo(".gallery-items-row");
    },

    responsiveImageItem(element) {
      if (element.prop("tagName") === "IMG") {
        element.addClass("img-fluid");
      }
    },

    openLightBox(element, lightboxId) {
      const fullSizeSrc = element.attr("data-src") || element.attr("src");
      const lightbox = $(`#${lightboxId}`);
      const lightboxImage = lightbox.find(".lightboxImage");
    
      // Récupérer toutes les images visibles après filtrage
      const galleryItems = element.closest('.gallery').find('.gallery-item:visible');
    
      // Trouver l'index de l'image cliquée dans la liste des images visibles
      const currentIndex = galleryItems.index(element);
    
      // Afficher l'image sélectionnée
      lightboxImage.attr("src", fullSizeSrc);
      lightbox.data("current-index", currentIndex);  // Stocker le bon index
    
      // Ouvrir la modale
      lightbox.modal("toggle");
    },    

    nextImage(lightboxId) {
      const lightbox = $(`#${lightboxId}`);
      const galleryItems = lightbox.closest('.gallery').find('.gallery-item:visible'); // Sélectionner uniquement les éléments visibles
      let currentIndex = lightbox.data("current-index");
    
      // Incrémenter l'index pour obtenir l'image suivante
      currentIndex = (currentIndex + 1) % galleryItems.length;  // Si on atteint la fin, revenir au début
    
      // Récupérer l'image suivante
      const nextItem = galleryItems.eq(currentIndex);
      const fullSizeSrc = nextItem.attr("data-src") || nextItem.attr("src");
    
      const lightboxImage = lightbox.find(".lightboxImage");
    
      // Mettre à jour l'image dans la modale
      lightboxImage.attr("src", fullSizeSrc);
      lightbox.data("current-index", currentIndex);  // Mettre à jour l'index actuel
    },    
    
    prevImage(lightboxId) {
      const lightbox = $(`#${lightboxId}`);
      const galleryItems = lightbox.closest('.gallery').find('.gallery-item:visible'); // Sélectionner uniquement les éléments visibles
      let currentIndex = lightbox.data("current-index");
    
      // Décrémenter l'index pour obtenir l'image précédente
      currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;  // Si on est au début, revenir à la fin
    
      // Récupérer l'image précédente
      const prevItem = galleryItems.eq(currentIndex);
      const fullSizeSrc = prevItem.attr("data-src") || prevItem.attr("src");
    
      const lightboxImage = lightbox.find(".lightboxImage");
    
      // Mettre à jour l'image dans la modale
      lightboxImage.attr("src", fullSizeSrc);
      lightbox.data("current-index", currentIndex);  // Mettre à jour l'index actuel
    },        

    createLightBox(gallery, lightboxId, navigation) {
      gallery.append(`<div class="modal fade" id="${
        lightboxId ? lightboxId : "myAwesomeLightbox"
      }" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-body">
                            ${
                              navigation
                                ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>'
                                : '<span style="display:none;" />'
                            }
                            <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
                            ${
                              navigation
                                ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}">></div>'
                                : '<span style="display:none;" />'
                            }
                        </div>
                    </div>
                </div>
            </div>`);
    },

    showItemTags(gallery, position, tags) {
      var tagItems =
        '<li class="nav-item"><span class="nav-link active active-tag"  data-images-toggle="all">Tous</span></li>';
      $.each(tags, function(index, value) {
        tagItems += `<li class="nav-item active">
                <span class="nav-link"  data-images-toggle="${value}">${value}</span></li>`;
      });
      var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

      if (position === "bottom") {
        gallery.append(tagsRow);
      } else if (position === "top") {
        gallery.prepend(tagsRow);
      } else {
        console.error(`Unknown tags position: ${position}`);
      }
    },

    filterByTag() {
      if ($(this).hasClass("active-tag")) {
        return;
      }
      $(".active-tag").removeClass("active active-tag");
      $(this).addClass("active-tag");

      var tag = $(this).data("images-toggle");

      $(".gallery-item").each(function() {
        $(this)
          .parents(".item-column")
          .hide();
        if (tag === "all") {
          $(this)
            .parents(".item-column")
            .show(300);
        } else if ($(this).data("gallery-tag") === tag) {
          $(this)
            .parents(".item-column")
            .show(300);
        }
      });
    }
  };

})(jQuery);
